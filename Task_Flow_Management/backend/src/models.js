import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:70},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  password:{type:String,required:true,minlength:8,select:false}
},{timestamps:true});
userSchema.pre("save",async function(){if(this.isModified("password"))this.password=await bcrypt.hash(this.password,12)});
userSchema.methods.comparePassword=function(p){return bcrypt.compare(p,this.password)};
userSchema.methods.safe=function(){return {_id:this._id,name:this.name,email:this.email}};
export const User=mongoose.model("User",userSchema);

const taskSchema=new mongoose.Schema({
  title:{type:String,required:true,trim:true,maxlength:140},
  description:{type:String,default:"",maxlength:3000},
  priority:{type:String,enum:["Low","Medium","High","Urgent"],default:"Medium"},
  dueDate:{type:Date,default:null},
  labels:[String],
  assignees:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
  attachmentUrl:{type:String,default:""},
  position:{type:Number,default:0},
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
},{timestamps:true});
const listSchema=new mongoose.Schema({title:{type:String,required:true,trim:true},position:Number,tasks:[taskSchema]},{timestamps:true});
const boardSchema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:80},
  description:{type:String,default:"",maxlength:300},
  color:{type:String,default:"#7568e8"},
  owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  members:[{user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},role:{type:String,enum:["owner","admin","member","viewer"],default:"member"}}],
  lists:[listSchema],
  activity:[{actor:{type:mongoose.Schema.Types.ObjectId,ref:"User"},action:String,detail:String,createdAt:{type:Date,default:Date.now}}]
},{timestamps:true});
export const Board=mongoose.model("Board",boardSchema);
