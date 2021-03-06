<template>
  <div class="seller" ref="seller">
    <div class="seller-content">
      <div class="overview">
        <h1 class="title">{{seller.name}}</h1>
        <div class="desc border-1px">
          <star v-bind:size="36" v-bind:score="seller.score"></star>
          <span class="text">({{seller.ratingCount}})</span>
          <span class="text">月售{{seller.sellCount}}单</span>
        </div>
        <ul class="remark">
          <li class="block">
            <h2>起送价</h2>
            <div class="content">
              <span class="strees">{{seller.minPrice}}元</span>
            </div>
          </li>
          <li class="block">
            <h2>商家配送</h2>
            <div class="content">
              <span class="strees">{{seller.deliveryPrice}}元</span>
            </div>
          </li>
          <li class="block">
            <h2>平均配送时间</h2>
            <div class="content">
              <span class="strees">{{seller.deliveryTime}}分钟</span>
            </div>
          </li>
        </ul>
        <div class="favorite" @click="toggleFavorite">
          <span class="icon-favorite" :class="{'active' : favorite}"></span>
          <span class="text">{{favoriteText}}</span>
        </div>
      </div>
      <split></split>
      <div class="bulletin">
        <h1 class="title">公告与活动</h1>
        <div class="content-wrapper border-1px">
          <p class="content">{{seller.bulletin}}</p>
        </div>
        <ul class="supports" v-if="seller.supports">
          <li class="supports-item border-1px" v-for="(item, index) in seller.supports">
            <span class="icon" v-bind:class="classMap[seller.supports[index].type]"></span>
            <span class="text">{{seller.supports[index].description}}</span>
          </li>
        </ul>
      </div>
      <split></split>
      <div class="pics">
        <h1 class="title">商家实景</h1>
        <div class="pic-wrapper" ref="picWrapper">
          <ul class="pic-list" ref="picList">
            <li class="pic-item" v-for="pic in seller.pics">
              <img v-bind:src="pic" width="120" height="90">
            </li>
          </ul>
        </div>
      </div>
      <split></split>
      <div class="info">
        <h1 class="title border-1px">商家信息</h1>
        <ul>
          <li class="info-item" v-for="info in seller.infos">{{info}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import BScroll from 'better-scroll';
  import star from 'components/star/star';
  import {saveToLocal, loadFromLocal} from 'common/js/store';
  import split from 'components/split/split';
  export default {
    props: {
       seller: {
          type: Object
       }
    },
    data() {
      return {
        selectedFood: {},
        favorite: (() => {
          // 读取favorite数据
          return loadFromLocal(this.seller.id, 'favorite', false);
        })()
      };
    },
    computed: {
      favoriteText() {
        return this.favorite ? '已收藏' : '收藏';
      }
    },
    created() {
      this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
    },
    watch: {
      // watch监听seller这个数据，一旦seller数据发生变化，就立即调用seller内部定义的方法，这里是this._inintScroll和this._initPics
      'seller'() {
         this.$nextTick(() => {
            this._initScroll();
         });
      }
    },
    mounted() {
      this.$nextTick(() => {
        this._initScroll();
        this._initPics();
      });
    },
    methods: {
      toggleFavorite() {
        this.favorite = !this.favorite;
        // 保存数据
        saveToLocal(this.seller.id, 'favorite', this.favorite);
      },
      _initScroll() {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.seller, {
             click: true
          });
        } else {
           this.scroll.refresh();
        }
      },
      _initPics() {
        if (this.seller.pics) {
          let picWidth = 120;
          let margin = 6;
          let width = (picWidth + margin) * this.seller.pics.length - margin;  // 总宽度
          this.$refs.picList.style.width = width + 'px';   // ul的宽度为所有图片的总宽度加上margin的值
          this.$nextTick(() => {
            if (!this.picScroll) {
             this.picScroll = new BScroll(this.$refs.picWrapper, {
               scrollX: true,
               eventPassthrough: true
             });
            }
          });
        }
      }
    },
    components: {
      star,
      split
    }
  };
</script>
<style lang="stylus" rel="stylesheet/stylus">
@import '../../common/stylus/mixin.styl';
.seller
  position: absolute
  top: 174px
  bottom: 0
  left: 0
  width: 100%
  overflow: hidden
  .overview
    position: relative
    padding: 18px
    .title
      margin-bottom: 8px
      line-height: 14px
      font-size: 14px
      color: rgb(7, 17, 21)
    .desc
      padding-bottom: 18px
      border-1px (rgb(7, 17, 21, 0.1))
      font-size: 0
      .star
        display: inline-block
        margin-right: 8px
        vertical-align: top
      .text
        display: inline-block
        margin-left: 8px
        vertical-align: top
        line-height: 18px
        font-size: 10px
        color: rgb(77, 85, 93)
    .remark
      display: flex
      padding-top: 18px
      .block
        flex: 1
        text-align: center
        border-right: 1px solid rgba(7, 17, 27, 0.1)
        &:last-child
          border: none
      h2
        margin-bottom: 4px
        line-height: 10px
        font-size: 10px
        color: rgb(147, 153, 159)
      .content
        line-height: 24px
        font-size: 10px
        color: rgb(7, 17, 27)
        .strees
          font-size: 24px
    .favorite
      position: absolute
      width: 50px
      right: 11px
      top: 18px
      text-align: center
      .icon-favorite
        display: block
        margin-bottom: 4px
        line-height: 24px
        font-size: 24px
        color: #d4d6d9
        &.active
          color: rgb(240, 20, 20)
  .bulletin
    padding: 18px 18px 0 18px
    .title
      margin-bottom: 8px
      line-height: 14px
      font-size: 14px
      color: rgb(7, 17, 27)
    .content-wrapper
      padding: 0 12px 16px 12px
      border-1px (rgba(7, 17, 27, 0.1))
      .content
        line-height: 24px
        font-size: 12px
        color: rgb(240, 20, 20)
    .supports
      .supports-item
        padding: 16px 12px
        border-1px (rgba(7, 17, 27, 0.1))
        font-size: 0
        &:last-child
          border-none()
        .icon
          display: inline-block
          width: 16px
          height: 16px
          vertical-align: top
          margin-right: 6px
          background-size: 16px 16px
          background-repeat: no-repeat
          &.decrease
            bg-image('decrease_4')
          &.discount
            bg-image('discount_4')
          &.guarantee
            bg-image('guarantee_4')
          &.invoice
            bg-image('invoice_4')
          &.special
            bg-image('special_4')
        .text
          line-height: 16px
          font-size: 12px
          color: rgb(7, 17, 27)
  .pics
    padding: 18px;
    .title
      margin-bottom: 12px
      line-height: 14px
      font-size: 14px
      color: rgb(7, 17, 27)
    .pic-wrapper
      width: 100%
      overflow: hidden
      white-space: normal
      .pic-list
        font-size:0
        .pic-item
          display: inline-block
          margin-right: 6px
          width: 120px
          height: 90px
          &:last-child
            margin: 0
  .info
    padding: 18px
    .title
      padding-bottom: 12px
      line-height: 14px
      font-size: 14px
      border-1px (rgba(7, 17, 27, 0.1))
      color: rgb(7, 17, 27)
    .info-item
      padding: 16px 12px
      line-height: 16px
      border-1px (rgba(7, 17, 27, 0.1))
      font-size: 12px
      color: rgb(7, 17, 27)
      &:last-child
        border-none ()
</style>
