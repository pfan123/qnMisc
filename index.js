//检查文件变化http://frontenddev.org/link/use-nodejs-whether-local-file-change-information.html

const qiniu = require("qiniu")
const path = require("path")
const fs = require("fs")
const images = require("images")
const chalk = require("chalk")
const log = console.log
const crypto = require('crypto')
const getChangeFile = require("./lib/diff.js")

const qiniu_config = JSON.parse(readToFile("qiniu_config.json"))
const accessKey = qiniu_config.access_key
const secretKey = qiniu_config.secret_key

qiniu.conf.ACCESS_KEY = accessKey
qiniu.conf.SECRET_KEY = secretKey

//要上传的空间
bucket = 'pfan';

//构建上传策略函数
function uptoken(bucket, key) {
  let putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
  return putPolicy.token();
}


/**
 * [uploadFile 上传到七牛云]
 * @param  {[type]} key       [上传到七牛后保存的文件名]
 * @param  {[type]} localFile [要上传文件的本地路径]
 */

//https://github.com/qiniu/nodejs-sdk.v6/blob/master/qiniu/io.js#L105    putReadable (uptoken, key, rs, extra, onret)传流， 
function uploadFile(key, localFile) {
  let token = uptoken(bucket, key)
  let extra = new qiniu.io.PutExtra()
  let rs = fs.createReadStream(localFile);
    qiniu.io.putReadable(token, key, rs, extra, function(err, ret) {
      if(!err) {
        // 上传成功， 处理返回值
        // console.log(ret)     
        log(chalk.red( curTime() ) + "  " + chalk.cyan(path.join('dist', ret.key) + "文件已经上传完毕"));
      } else {
        // 上传失败， 处理返回代码
        console.log(err);
      }
  });
}

//获取变更的文件
let changed = getChangeFile.get('./src', function(item){
  if(/.*\.jpg|jpeg|png|gif|bmp(?=\?|$)/i.test(item)){
    return true;
  }else{
    return false;
  }
},function(item, dist){
  let dir = path.dirname(item).replace("src", '')
  let name = path.basename(item).replace("src", '')

  if(dir == ''){
    let read = fs.readFileSync(path.join(process.cwd(), item), 'utf-8'); 
    fs.writeFileSync(path.join(dist, name), read, 'utf-8'); 
  }else{

    try{
        fs.accessSync(path.join(dist, dir), fs.F_OK);
    }catch(e){
        fs.mkdirSync(path.join(dist, dir))
    }
    let read = fs.readFileSync(path.join(process.cwd(), item), 'utf-8');     
    fs.writeFileSync(path.join(dist, dir, name), read, 'utf-8'); 
  }
});

//打水印
changed.forEach( (file) => {
  log(chalk.red( curTime() ) + "  " + chalk.cyan(file + "文件发生了变更"));
  let  imgObj = images(path.join(process.cwd(), file))
  let  width = images(path.join(process.cwd(), file)).width()
  let  height = images(path.join(process.cwd(), file)).height()
  if(width > 900){

    if(height*900/width > 100){
      imgObj.size(900)
            .draw(images(path.join(process.cwd(), './watermark.png')), 900-214, (height*900/width)-30) 
            .saveAsync(path.join(process.cwd(), file.replace('src','dist')), {               
                  quality : 50        //Save the image to a file,whih quality 50
            });  
    }else{
      imgObj.size(900)
            .saveAsync(path.join(process.cwd(), file.replace('src','dist')), {               
                  quality : 50        //Save the image to a file,whih quality 50
            });        
    }

  }else if(width>200 && width<=900){

    if(height > 100){
      imgObj.draw(images(path.join(process.cwd(), './watermark.png')), width-214, height-30) 
            .saveAsync(path.join(process.cwd(), file.replace('src','dist')), {               
                  quality : 50        //Save the image to a file,whih quality 50
            });  
    }else{
      imgObj.saveAsync(path.join(process.cwd(), file.replace('src','dist')), {               
                  quality : 50        //Save the image to a file,whih quality 50
            });        
    }    
 
  }else{
    imgObj.saveAsync(path.join(process.cwd(), file.replace('src','dist')), {               
                quality : 20        //Save the image to a file,whih quality 50
          });   
  }

})

try{
  //上传
  if(changed.length >= 1){
    log(chalk.red( curTime() ) + "  " + chalk.red("上传变更文件："));

    //调用uploadFile上传
    changed.forEach( (file) => {
      uploadFile(file.replace('src/', ''), path.join(process.cwd(), file.replace('src', 'dist')));
    })  
  }else{
    log(chalk.red( curTime() ) + "  " + chalk.red("没有任何文件变更"));
  }

}catch(err){
  console.log(err)
}



/*
 * [writeToFile description]
 * @param  {[type]} data [数组数据列表]
 * @param  {[type]} path [写入的路径]
 */
 function writeToFile(data, path, calllback){
 	var data = JSON.stringify(data, null, "\t");
 	fs.writeFile(path, data, "utf-8", function(err){
 		if(err) throw err;
 		calllback && calllback();
 	});
 }

 /*
 * [readToFile 读取文件]
 * @param  {[type]} path [读取路径]
 */
function readToFile(path, calllback){
	var data = fs.readFileSync(path,'UTF-8');
	calllback && calllback();
	return data;
}

/*
 * [curTime 生成当前时间 例［2016-03-07 19:00:00］]
 * @return {[type]} [description]
 */
function curTime() {
    var date = new Date();
    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    var hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    var mm = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    return "["+date.getFullYear() + "-" + month + "-" + currentDate+" "+hh + ":" + mm+"]";
    //返回格式：yyyy-MM-dd hh:mm
}