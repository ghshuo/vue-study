<template>
    <el-container id="header">
        <!-- <el-row> -->
            <el-col :span="12" class="header-left">
                <!-- <transition>
                    <div class="header-three-parent" @click="transformBtn" :class="isRotate ? 'roate-div' : 'roated-div'">
                        <i class="header-three"></i>
                        <i class="header-three"></i>
                        <i class="header-three"></i>
                    </div>
                </transition> -->
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item :to="{ path: '/silder' }">首页</el-breadcrumb-item>
                    <el-breadcrumb-item v-for="(items, index) in $route.meta" :key="index">{{items}}</el-breadcrumb-item>
                </el-breadcrumb>
            </el-col>
        <!-- </el-row> -->
        <el-col :span="12" class="header-right">
            <el-dropdown class="header-dropdown" @command="handleCommand">
                <div class="el-dropdown-link user-info">
                    <span class="user-name">xiaobai</span>
                    <img src="../../assets/images/avart.jpg" alt="" class="user-avart">
                </div>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="set">设置</el-dropdown-item>
                    <el-dropdown-item divided command="setOut">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </el-col>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            isRotate: true
        }
    },
    methods: {
        transformBtn() {
            this.isRotate = !this.isRotate;
        },
        handleCommand(command) {
            console.log(command);
            if(command == 'set') {
                this.$router.push({path: '/set'});
            } else if(command == "setOut") {  // 正式项目此处会调用接口
                this.$confirm("确定要退出吗？", "提示信息", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(() => {
                    this.$message({
                        type: "success",
                        message: "已退出！"
                    });
                    sessionStorage.removeItem('user');    
                    this.$router.push({path: '/'});
                }).catch(() => {
                    this.$message({
                        type: "info",
                        message: "已取消退出！"
                    })
                })
            }
        }
    }
}    
</script>

<style lang="scss" rel="stylesheet">
#header{
    background: #eff2f7;
    height: 60px;
    line-height: 60px;
    .header-left{
        margin-left: 20px;
        .el-breadcrumb{
            line-height: 60px;
        }
    }    
    .header-right{
        text-align: right;
        margin-right: 20px;
    }
    .header-three-parent{
        overflow: hidden;
        width: 20px;
        height: 20px;
        margin: 20px;
        padding: 0;
        .header-three{
            float: left;
            display: inline-block;
            border-top: 2px solid #000;
            margin: 2px 0;
            width: 20px;
            height: 0px;
        }
    }
    .roate-div{
        transform: rotate(0deg);
        transition: all .2s;
    }
    .roated-div{
        transform: rotate(90deg);
        transition: all .2s;
    }
    .header-dropdown{
        
       .user-info{
            height: 60px;
            line-height: 60px;
            overflow: hidden;
            span{
                float: left;
                font-weight: bold;
            }
            img{
                float: left;
                border-radius: 50px;
                width: 40px;
                height: 40px;
                margin: 10px 0 0 10px;
            }
       }
    }
}

</style>

