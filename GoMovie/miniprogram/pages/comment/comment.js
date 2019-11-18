// pages/comment/comment.js
const db = wx.cloud.database();
Page({
  data: {
    content:"",  //用户评论内容
    score:0,     //用户分数
    id:0,  //当前电影id
    detail:{},   //云函数返回结果
    images:[],  //选中图片列表
    fileIds:[], //上传成功后文件fileID
    isShow:false,
    createTime:0
  },
  submit:function(){
    //功能:发表评论
    //(1)上传多张图片
    //1:创建数据库对象
    //2:在data中添加属性fileIds:[]
    //3:显示数据加载提示框
    wx.showLoading({
      title: '发表评论中...',
    })
    //4:创建数组(添加Promise对象)
    var rows = [];
    //4.1:判断用户是否选择图片,如果没有停止
    if(this.data.images.length==0){
      wx.showToast({
        title: '请选择图片',
      });
      return;
    }
    //5:创建循环遍选中图片 images
   for(var i=0;i<this.data.images.length;i++){
       //6:上传一张图片
       //7:创建Promise对象完成上传图片操作
       //  将Promise保存数组中
     rows.push(new Promise((resolve,reject)=>{
       //8:获取当前要上传图片名称
       var item = this.data.images[i];
       //9:获取图片名称后缀 a.jpg
       //  正则表达式 19
       ///\.\w+$/.exec('a.jpg')=>[.jpg]
       var su = /\.\w+$/.exec(item)[0];
       //10:创建新文件名 时间+随机数+后缀
       var newFile=new Date().getTime();
       newFile+=Math.floor(Math.random()*999);
       newFile+=su;
       //12928293999.jpg
       //11:上传指定图片
       wx.cloud.uploadFile({
         cloudPath:newFile ,//新文件名
         filePath:item,     //原文件名
         success:(res)=>{   //上传成功
          //12:将上传成功fileID保存数组
          var fid = res.fileID;//云存储图片路径
          this.data.fileIds.push(fid);
          //13:调用解析方法,上传成功
          resolve();
         }
       })
     }));//Promise end
   }//for end
   //(2)将图片fileID, 评论, 分数保存
   //14:等待所有Promise对象执行完毕(上传)
   //15:将云数据库中添加一条记录
   Promise.all(rows).then(res=>{
   //16:在云开发控制面板中添加集合comment1906
   //17:获取分数
   var s = this.data.score;
   //18:留言
   var m = this.data.content;
   //19:获取上传到云存储所有fid
   var fids = this.data.fileIds;
   //20:向集合coment1906中添加一条记录
   db
   .collection("comment1906")
   .add({
     data:{
       content:m,
       score:s,
       fileIds:fids,
       createTime:db.serverDate(),//添加该字段
       movieId:this.data.id
     }
   })
   .then(res=>{
     wx.hideLoading();
     wx.showToast({
       title: '评论成功'
     })
     this.mentShow();
     this.data.fileIds=[];
     this.setData({
       score:0,
       content:'',
       images:[],
       createTime:0,
       movieId:0
     })
   })
   .catch(err=>{
      console.log(err);
   });
   //21:添加成功隐藏加载提示框
   //22:显示提示框评论成功
   })
  },
  selectImg:function(){
    //功能：选中多张图片;并且预览效果
    //2:指定图片类型 图片来源
    //3:指定图片数量
    //4:选中成功
    wx.chooseImage({
      count: 9,//1:选中多张图片
      sizeType:["original","compressed"],
      sourceType:["album","camera"],
      success: (res)=> {
        if(this.data.images.length>0){
          var list=[].concat(this.data.images,res.tempFilePaths)
          this.setData({images:list})
        }else{ 
        this.setData({
            images: res.tempFilePaths
        })
      }
        //5:在data添加属性images:[]
        //6:将返回结果保存images
        //7:在模板显示图片
      },
    })

  },
  onScoreChange:function(event){
    //功能:修改分数
    //1:添加参数event
    //2:获取event.detail输入分数保存score
    this.setData({
       score:event.detail
    })
  },
  onContentChange:function(event){
    //1:添加参数event
    //2:获取event.detail 输入内容保存conten中
    this.setData({
      content:event.detail
    })
  },
  onLoad: function (options) {
     //1:获取参数id
     var id = options.id;
     //2:将参数id 保存data中
     this.setData({id:id})
     console.log(id);
     //3:调用loadMore函数
     this.loadMore();
     this.mentShow();
  },
  loadMore:function(){
    //功能:组件创建成功后调用云函数显示当前
    //电影详细
    //1:获取当前电影id
    var id = this.data.id;
    console.log(id);
    //2:显示加载数据提示框... 旋转小动画
    wx.showLoading({
      title: '数据加载中...',
    })
    //3:调用云函数findDetail1906
    //  参数id    16:54
    wx.cloud.callFunction({
       name:"findDetail1906",
       data:{id:id}
    }).then(res=>{
      // console.log(res.result);
      var obj = JSON.parse(res.result);
      //4:获取云函数返回结果 18
      //5:在data添加属性 detail
      //    保存data detail
      this.setData({
        detail:obj
      })
      //6:隐藏加载提示框
      wx.hideLoading(); 
    }).catch(err=>{
      console.log(err)
    })
     
  },
  mentShow:function(){
    db.collection("comment1906")
    .where({movieId:this.data.id})
    .orderBy('createTime','desc')
    .get()
    .then(res=>{
      console.log(res);
      this.setData({comment:res.data})
    })
    .catch(err=>{console.log(err);})
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})