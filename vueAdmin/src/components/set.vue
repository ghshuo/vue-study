<template>
    <div id="set">
        <el-container>
            <v-header></v-header>
        </el-container>
        <el-main>
            <h3> 我是set.vue</h3>
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

