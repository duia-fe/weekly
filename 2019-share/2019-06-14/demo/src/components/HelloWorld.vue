<template>
  <div class="hello">
    <Loading/>
    <div v-if="visible" key="332">
      <span>text1111:</span>
      <input key="222" type="text">
      <input type="text">
    </div>
    <div v-else key="2121">
      <span>text22222:</span>
      <input type="text">
      <input key="2333" type="text">
    </div>
    <div v-if="visible" key="1">
      <Test data-id="1" >这个是ID等于1</Test>
    </div>
    <div v-else key="2">
      <Test data-id="2" >这个是ID等于2</Test>
    </div>
  
  </div>
</template>

<script>
import Test from "./Test";
export default {
  name: "HelloWorld",
  components: {
    Test
  },
  data() {
    return {
      inputVal: "",
      visible: true
    };
  },
  mounted() {
    setInterval(() => {
      this.visible = !this.visible;
    }, 4000);
  }
};
</script>

<style scoped>
</style>
