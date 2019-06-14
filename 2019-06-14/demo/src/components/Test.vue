<template>
	<div class="test">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: 'Test'
}
</script>
<style>
.test {
	animation: test 2s forwards;
}
@keyframes test {
	0% {
		color: green;
		font-size: 12px;
	}
	100% {
		color: red;
		font-size: 60px;
	}
}
</style>

