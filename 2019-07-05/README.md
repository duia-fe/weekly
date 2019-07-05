### 1：input 中文输入法问题

```javascript
<input
 type="text"
 onCompositionStart={this.compositionStart.bind(this)}
 onCompositionEnd={this.compositionEnd.bind(this)}
 onChange={this.change.bind(this)}
 ref="input"
 key="2"/>
compositionStart() {
	this.setState({
		valstate: false
	});
}
compositionEnd(e) {
  e.persist && e.persist();
  this.setState({valstate: true}, () => {
				this.change(e);
			}
		);
	}
change(e) {
	const { valstate } = this.state;
	if (!valstate) {
		return;
	}
	let val = e.target.value;
	let regs = /^[\u4E00-\u9FA5a-zA-Z]+$/g;
	if (regs.test(val) || val === '') {
		this.setPushdata('name', val);
		this.refs.input.value = val;
	}
}
```

- 注意：
  如果要以异步方式访问事件属性，则应调用`event.persist()`事件，该事件将从池中删除合成事件，并允许用户代码保留对事件的引用。
  https://reactjs.org/docs/events.html#event-pooling

### 2：ios 机型 调用 jsdk 获取签名要在首页调用

### 3：微信浏览器，监听返回键，退出浏览器 （ios 机型）

```javascript
closeWindowfn() {
	window.wx.closeWindow();
	this.pushHistory();
},
pushHistory() {
	let state = {
		title: 'title',
		url: '#'
	};
	window.history.pushState(state, null, '#');
}
componentDidMount() {
	Exit.pushHistory();
	window.addEventListener('popstate', Exit.closeWindowfn, false);
}
componentWillUnmount() {
	window.removeEventListener('popstate', Exit.closeWindowfn, false);
}
```

---

分享：`龙佳`
