// pages/mymovie/mymovie.js
const db = wx.cloud.database();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    content:"", //留言内容
    images:[],   //选中图片
    list:[],
    detail:[]
  },
  handle3: function (event) {
    //功能：获取用户信息，提前是否允许确认框
    //头像/昵称/性别/省/市/..
    console.log(event)
  },
  skip(event){
    //功能:点击图片跳转到该电影的详情
    var id=event.target.dataset.id;
    console.log(id)
    wx.navigateTo({
      url: '/pages/comment/comment?id=' + id,
    })
  },
  submit() {
    // 功能一：上传一张指定图片images，将图片fileID保存
    // 功能二：将留言/fileID添加云数据库
    // 1.显示加载提示框
    wx.showLoading({
      title: '评论中...',
    })
    // 2.获取选中文件的文件名
    if (this.data.images.length == 0) {
      wx.showToast({
        title: '请选择图片',
      });
      return;//停止程序运行
    }
    var item = this.data.images;
    // 3.使用正则表达式获取文件名后缀
    var su = /\.\w+$/.exec(item)[0];
    // 4.创建新文件名 时间+随机数+后缀
    var newFile = new Date().getTime();
    newFile += Math.floor(Math.random() * 999);
    newFile += su;
    console.log(newFile);
    // 5.上传图片
    wx.cloud.uploadFile({
      cloudPath: newFile,//新文件名
      filePath: item,//原文件名
      success: (res) => {//上传成功
        console.log(res.fileID)
        var fileId = res.fileID;
        var m = this.data.content;
        db.collection("mymovie1906")
          .add({
            data: {
              fileId: fileId,
              content: m
            }
          })
          .then(res => {
            wx.hideLoading();
            console.log(res)
            wx.showToast({
              title: '发表成功',
            })
          })
          .catch(err => {
            console.log(err)
          })
      }
    })
    // 6.指定上传图片新文件名/选中文件
    // 7.上传成功获取当前文件fileID
    // 8.获取评论内容
    // 9.在云开发控制面板中创建集合mymovie1906
    // 10.添加数据库对象
    // 11.将fileID内容添加集合中
    // 12.隐藏加载提示框
  },
  onContentChange:function(event){
   //功能:输入双向绑定
   //1:添加参数event
   //2:获取event.detail保存content
   this.setData({
     content:event.detail
   })
  },
  selectImg:function(){
    //功能1:获取用户选中图片交且保存images:{}
    //1:显示加载提示框
    wx.showLoading({
      title: '图片上传中...',
    })
    //2:选择一张图片
    //3:类型
    //4:来源   17:48
    wx.chooseImage({
      count:1,   //选中数量 1
      sizeType:["original","compressed"],
      sourceType:["album","camera"],
      success: (res)=> {
        //5:选择功能
        //6:将当前图片保存对象中
        var file = res.tempFilePaths[0];
        this.setData({
          images:file
        })
        //7:隐藏
        wx.hideLoading();
      },
    })
  },
  select() {
    db.collection("mylike1906")
      .get()
      .then(res => {
        this.setData({
          list: res.data //属性：云数据库数据
        });
        // this.onLoad();
      })
      .catch(err => {
        console.log(err)
      });
  },
  selectCom() {
    db.collection("mymovie1906")
      .get()
      .then(res => {
        console.log(res.data)
        this.setData({
          comment: res.data //属性：云数据库数据
        });
      })
      .catch(err => {
        console.log(err)
      });
  },
  onLoad: function (options) {
    this.select();
    this.selectCom()
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