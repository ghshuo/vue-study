<template>
    <div id="leftNav">
        <ul>
            <li>
                <i class="icon iconfont icon-goumai"></i>
                <div>收银</div>
            </li>
            <li>
                <i class="icon iconfont icon-dianpu"></i>
                <div>店铺</div>
            </li>
            <li>
                <i class="icon iconfont icon-shangpin"></i>
                <div>商品</div>
            </li>
            <li>
                <i class="icon iconfont icon-huiyuanqia"></i>
                <div>会员</div>
            </li>
            <li>
                <i class="icon iconfont icon-tongji"></i>
                <div>统计</div>
            </li>
            <li>
                <i class="icon iconfont icon-gongnengjianyi"></i>
                <div>设置</div>
            </li>
        </ul>
    </div>   
</template>
<script>
    export default {
        data() {
            return {}
        }
    }
</script>

<style>
/* scoped  属性表示css只在本组件生效 */
#leftNav{
    color: #fff;
    font-size: 10px;
    height: 100%;
    background-color: #1b8ce0;
    float: left;
    width: 5%;
}
.iconfont{
    font-size: 18px;
}
#leftNav ul{
    padding: 0px;
    margin: 0px;
}
#leftNav li{
    list-style: none;
    text-align: center;
    border-bottom: 1px solid #000;
    padding: 10px;
}
</style>

