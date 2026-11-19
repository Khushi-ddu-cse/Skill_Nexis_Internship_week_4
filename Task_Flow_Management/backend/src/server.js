import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import {User,Board} from "./models.js";

const app=express();
app.use(helmet());
app.use(cors({origin:process.env.CLIENT_URL||"http://localhost:5173"}));
app.use(express.json({limit:"1mb"}));

const asyncRoute=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const tokenFor=id=>{
  if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)throw Error("JWT_SECRET must be at least 32 characters.");
  return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||"7d"});
};
const auth=asyncRoute(async(req,res,next)=>{
  const token=(req.headers.authorization||"").replace(/^Bearer /,"");
  if(!token)return res.status(401).json({message:"Please log in."});
  try{const p=jwt.verify(token,process.env.JWT_SECRET);req.user=await User.findById(p.id);if(!req.user)return res.status(401).json({message:"Account not found."});next();}
  catch{return res.status(401).json({message:"Session invalid or expired."});}
});
const access=asyncRoute(async(req,res,next)=>{
  const b=await Board.findById(req.params.id).populate("members.user","name email").populate("lists.tasks.assignees","name email").populate("activity.actor","name");
  if(!b)return res.status(404).json({message:"Board not found."});
  const m=b.members.find(x=>String(x.user?._id||x.user)===String(req.user._id));
  if(!m)return res.status(403).json({message:"You do not have access to this board."});
  req.board=b;req.role=m.role;next();
});
const roles=(...allowed)=>(req,res,next)=>allowed.includes(req.role)?next():res.status(403).json({message:"Your role cannot perform this action."});
const log=(b,u,action,detail="")=>{b.activity.unshift({actor:u,action,detail});b.activity=b.activity.slice(0,50)};
const defaults=()=>["Backlog","To do","In progress","Done"].map((title,position)=>({title,position,tasks:[]}));

app.get("/api/health",(req,res)=>res.json({status:"ok",service:"TaskFlow API"}));
app.use("/api/auth",rateLimit({windowMs:900000,limit:100}));
app.post("/api/auth/register",asyncRoute(async(req,res)=>{
  const {name,email,password}=req.body;
  if(!name?.trim()||!email?.trim()||!password)return res.status(400).json({message:"Name, email and password are required."});
  if(password.length<8)return res.status(400).json({message:"Password must contain at least 8 characters."});
  const u=await User.create({name:name.trim(),email:email.toLowerCase().trim(),password});
  res.status(201).json({token:tokenFor(u._id),user:u.safe()});
}));
app.post("/api/auth/login",asyncRoute(async(req,res)=>{
  const u=await User.findOne({email:String(req.body.email||"").toLowerCase().trim()}).select("+password");
  if(!u||!(await u.comparePassword(req.body.password||"")))return res.status(401).json({message:"Incorrect email or password."});
  res.json({token:tokenFor(u._id),user:u.safe()});
}));
app.get("/api/auth/me",auth,(req,res)=>res.json({user:req.user.safe()}));

app.get("/api/boards",auth,asyncRoute(async(req,res)=>{
  const boards=await Board.find({"members.user":req.user._id}).sort({updatedAt:-1});
  res.json({boards});
}));
app.post("/api/boards",auth,asyncRoute(async(req,res)=>{
  if(!req.body.name?.trim())return res.status(400).json({message:"Project name is required."});
  const b=await Board.create({name:req.body.name.trim(),description:req.body.description||"",owner:req.user._id,members:[{user:req.user._id,role:"owner"}],lists:defaults(),activity:[{actor:req.user._id,action:"created this board"}]});
  res.status(201).json({board:b});
}));
app.get("/api/boards/:id",auth,access,(req,res)=>res.json({board:req.board,role:req.role}));
app.put("/api/boards/:id",auth,access,roles("owner","admin"),asyncRoute(async(req,res)=>{
  if(req.body.name?.trim())req.board.name=req.body.name.trim();
  if(typeof req.body.description==="string")req.board.description=req.body.description;
  if(/^#[0-9a-f]{6}$/i.test(req.body.color||""))req.board.color=req.body.color;
  log(req.board,req.user._id,"updated board details");await req.board.save();res.json({board:req.board});
}));
app.delete("/api/boards/:id",auth,access,roles("owner"),asyncRoute(async(req,res)=>{await req.board.deleteOne();res.json({message:"Board deleted."})}));

app.post("/api/boards/:id/members",auth,access,roles("owner","admin"),asyncRoute(async(req,res)=>{
  const u=await User.findOne({email:String(req.body.email||"").toLowerCase().trim()});
  if(!u)return res.status(404).json({message:"User not found. Ask them to register first."});
  if(req.board.members.some(m=>String(m.user?._id||m.user)===String(u._id)))return res.status(409).json({message:"Already a member."});
  const role=["admin","member","viewer"].includes(req.body.role)?req.body.role:"member";
  req.board.members.push({user:u._id,role});log(req.board,req.user._id,`added ${u.name} as ${role}`);await req.board.save();await req.board.populate("members.user","name email");res.status(201).json({members:req.board.members});
}));
app.patch("/api/boards/:id/members/:uid",auth,access,roles("owner","admin"),asyncRoute(async(req,res)=>{
  const m=req.board.members.find(x=>String(x.user?._id||x.user)===req.params.uid);
  if(!m||m.role==="owner")return res.status(404).json({message:"Member not found or owner cannot be changed."});
  if(req.role==="admin"&&m.role==="admin")return res.status(403).json({message:"Admins cannot change another admin."});
  if(!["admin","member","viewer"].includes(req.body.role))return res.status(400).json({message:"Invalid role."});
  m.role=req.body.role;await req.board.save();res.json({members:req.board.members});
}));
app.delete("/api/boards/:id/members/:uid",auth,access,roles("owner","admin"),asyncRoute(async(req,res)=>{
  const m=req.board.members.find(x=>String(x.user?._id||x.user)===req.params.uid);
  if(!m||m.role==="owner")return res.status(404).json({message:"Member not found or owner cannot be removed."});
  if(req.role==="admin"&&m.role==="admin")return res.status(403).json({message:"Admins cannot remove another admin."});
  req.board.members=req.board.members.filter(x=>String(x.user?._id||x.user)!==req.params.uid);await req.board.save();res.json({members:req.board.members});
}));

app.post("/api/boards/:id/lists",auth,access,roles("owner","admin","member"),asyncRoute(async(req,res)=>{
  if(!req.body.title?.trim())return res.status(400).json({message:"List title required."});
  req.board.lists.push({title:req.body.title.trim(),position:req.board.lists.length,tasks:[]});log(req.board,req.user._id,"added list",req.body.title);await req.board.save();res.status(201).json({board:req.board});
}));
app.put("/api/boards/:id/lists/:lid",auth,access,roles("owner","admin","member"),asyncRoute(async(req,res)=>{
  const l=req.board.lists.id(req.params.lid);if(!l)return res.status(404).json({message:"List not found."});
  if(req.body.title?.trim())l.title=req.body.title.trim();await req.board.save();res.json({board:req.board});
}));
app.delete("/api/boards/:id/lists/:lid",auth,access,roles("owner","admin"),asyncRoute(async(req,res)=>{
  const l=req.board.lists.id(req.params.lid);if(!l)return res.status(404).json({message:"List not found."});
  l.deleteOne();log(req.board,req.user._id,"deleted list",l.title);await req.board.save();res.json({board:req.board});
}));
app.post("/api/boards/:id/lists/:lid/tasks",auth,access,roles("owner","admin","member"),asyncRoute(async(req,res)=>{
  const l=req.board.lists.id(req.params.lid);if(!l)return res.status(404).json({message:"List not found."});
  if(!req.body.title?.trim())return res.status(400).json({message:"Task title required."});
  l.tasks.push({title:req.body.title.trim(),description:req.body.description||"",priority:["Low","Medium","High","Urgent"].includes(req.body.priority)?req.body.priority:"Medium",dueDate:req.body.dueDate||null,labels:req.body.labels||[],attachmentUrl:req.body.attachmentUrl||"",assignees:(req.body.assignees||[]).filter(id=>req.board.members.some(m=>String(m.user?._id||m.user)===String(id))),createdBy:req.user._id,position:l.tasks.length});
  log(req.board,req.user._id,"created task",req.body.title);await req.board.save();res.status(201).json({board:req.board});
}));
app.put("/api/boards/:id/tasks/:tid",auth,access,roles("owner","admin","member"),asyncRoute(async(req,res)=>{
  let t;for(const l of req.board.lists){t=l.tasks.id(req.params.tid);if(t)break}
  if(!t)return res.status(404).json({message:"Task not found."});
  for(const k of ["title","description","priority","dueDate","attachmentUrl"])if(k in req.body)t[k]=req.body[k];
  if(Array.isArray(req.body.labels))t.labels=req.body.labels;
  if(Array.isArray(req.body.assignees))t.assignees=req.body.assignees.filter(id=>req.board.members.some(m=>String(m.user?._id||m.user)===String(id)));
  log(req.board,req.user._id,"updated task",t.title);await req.board.save();res.json({board:req.board});
}));
app.delete("/api/boards/:id/tasks/:tid",auth,access,roles("owner","admin","member"),asyncRoute(async(req,res)=>{
  let t;for(const l of req.board.lists){t=l.tasks.id(req.params.tid);if(t)break}
  if(!t)return res.status(404).json({message:"Task not found."});const title=t.title;t.deleteOne();log(req.board,req.user._id,"deleted task",title);await req.board.save();res.json({board:req.board});
}));
app.put("/api/boards/:id/tasks/:tid/move",auth,access,roles("owner","admin","member"),asyncRoute(async(req,res)=>{
  const target=req.board.lists.id(req.body.targetListId);if(!target)return res.status(404).json({message:"Target list not found."});
  let source,task;for(const l of req.board.lists){task=l.tasks.id(req.params.tid);if(task){source=l;break}}
  if(!task)return res.status(404).json({message:"Task not found."});
  const obj=task.toObject();task.deleteOne();const index=Math.max(0,Math.min(Number(req.body.targetIndex)||0,target.tasks.length));target.tasks.splice(index,0,obj);
  req.board.lists.forEach(l=>l.tasks.forEach((t,i)=>t.position=i));log(req.board,req.user._id,"moved task",obj.title);await req.board.save();res.json({board:req.board});
}));

app.use((req,res)=>res.status(404).json({message:"API route not found."}));
app.use((err,req,res,next)=>{console.error(err);if(err.code===11000)return res.status(409).json({message:"Email already registered."});if(err.name==="ValidationError")return res.status(400).json({message:Object.values(err.errors).map(e=>e.message).join(" ")});res.status(500).json({message:err.message||"Server error."})});

if(!process.env.MONGODB_URI)console.error("Set MONGODB_URI in backend/.env");
mongoose.connect(process.env.MONGODB_URI||"mongodb://127.0.0.1:27017/taskflow")
  .then(()=>{console.log("MongoDB connected");app.listen(process.env.PORT||5000,()=>console.log(`TaskFlow API running on ${process.env.PORT||5000}`));})
  .catch(e=>{console.error("Server startup failed:",e.message);process.exit(1)});
