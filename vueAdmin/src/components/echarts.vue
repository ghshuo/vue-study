<template>
    <div>
        <el-container id="echarts">
            <v-header></v-header>
        </el-container>
        <el-main>
            <h3>我是ECharts.vue</h3>
        </el-main>
    </div>
</template>
<script>
import header from './header/header';
export default {
    data() {
        return {

        }
    },
    components: {
        'v-header': header
    }
}    
</script>
<style>

</style>

