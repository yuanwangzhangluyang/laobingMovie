// pages/home/home.js
const db = wx.cloud.database();
Page({
  data: {
    list: [], //查询电影列表
    imgs: [], //轮播图图片
    myimg: [],
  },
  joinLike(event){
    var t=event.target.dataset.title;
    var img=event.target.dataset.img;
    var id = event.target.dataset.id;
    db.collection("mylike1906")
    .add({
      data:{img,id,title:t}
    })
    .then(res=>{
      wx.showToast({
        title: '加入我的喜欢',
      })
    })
    .catch(err=>{console.log(err)})
  },
  jumpComment: function (event) {
    //1:添加参数event事件对象
    //2:依据event获取自定义属性id
    var id = event.target.dataset.id;
    console.log(id);
    //3:跳转/pages/comment/comment参数id
    var url = "/pages/comment/comment?id=" + id
    wx.navigateTo({
      url: url,
    })
  },
  loadMore: function () {
    //功能:当组件创建成功调用云函数
    //获取云函数返回结果并显示
    //start:参数 0 10 20 30
    //1:调用云函数
    wx.cloud.callFunction({
      name: "movielist1906",//云函数名
      data: { start: this.data.list.length }       //参数47
    })
      .then(res => {           //成功回调
        //console.log(res.result)
        var rows = JSON.parse(res.result);
        //9"
        rows = this.data.list.concat(rows.subjects);
        var img = rows.slice(0, 18)
        var imgss = rows.slice(0, 6)
        console.log(img)
        this.setData({
          list: rows,
          imgs: img,
          myimg: imgss
        })
      })
      .catch(err => {          //失败回调
        console.log(err)
      })
    //2:传递start
    //3:获取云函数返回结果并且保存 list

  },
  onLoad: function (options) {
    this.loadMore();
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
    //console.log(123);
    //加载下一页数据
    this.loadMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})