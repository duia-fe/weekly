<template>
	<div class="hello">
		<Loading/>
		<Test v-if="visible">这个是ID等于1</Test>
		<Test v-else>这个是ID等于2</Test>
	</div>
</template>

<script>
import Test from './Test'
export default {
	name: "HelloWorld",
	components: {
		Test
	},
	data() {
		return {
			visible: true
		}
	},
	mounted() {
		setInterval(() => {
			this.visible = !this.visible
		}, 4000);
	},
};
</script>

<style scoped>
</style>
