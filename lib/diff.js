//https://github.com/confcompass/fs-walk
//https://github.com/litheModule/lithe/blob/master/README.md

const lithe = require('lithe')
const hfs = lithe.hfs
const chalk = require("chalk")
const fs = require("fs")
const crypto = require('crypto')
const path = require('path')


function getMd5(src){
	let str = fs.readFileSync(src,'utf-8');
	let md5 = crypto.createHash('md5');
	md5.update(str);
	return md5.digest('base64');
}


function getChangeFile(){
	this.dataDistFlod = path.join(process.cwd(), './dist');
	this.dataBaseFlod = path.join(process.cwd(), './.misc');
	this.dataBase = path.join(process.cwd(), './.misc/filelist');

	if(!fsExistsSync(this.dataDistFlod)){
		fs.mkdirSync(this.dataDistFlod)
	}

	if(!fsExistsSync(this.dataBaseFlod)){
		fs.mkdirSync(this.dataBaseFlod)
	}

	if(!fsExistsSync(this.dataBase)){
		fs.writeFileSync(this.dataBase, '{}', 'utf-8');	
	}
}

/**
 * [fsExistsSync 检测文件]
 */
function fsExistsSync(src) {
    try{
        fs.accessSync(src, fs.F_OK);
    }catch(e){
        return false;
    }
    return true;
}

getChangeFile.prototype = {
	constructor: getChangeFile,

	get: function(p, filter, walk){
		let self = this,
		base = fs.readFileSync(this.dataBase),
		changedList = [],
		files;
		base = JSON.parse(base);

		hfs.walk(p, function(lists,a){
			files = lists;
			files.forEach(function(filepath){
				var md5str = getMd5(filepath).toString();

				if(!base[filepath] || (base[filepath] && base[filepath] !== md5str)){
					 changedList.push(filepath);
					 walk(filepath, self.dataDistFlod);
				}
				base[filepath] = md5str;	
			});

			hfs.writeFileSync(self.dataBase, JSON.stringify(base, null, "\t"), 'utf-8');
		},{
			filter:filter
		});

		return changedList;
	}
};

module.exports = new getChangeFile();
