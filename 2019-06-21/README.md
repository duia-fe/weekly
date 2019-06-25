大家好，今天给大家分享一下node端（使用的koa）GraphQL+Sequelized的使用和移动端分享部分兼容（UC，QQ浏览器）

### 分享使用[GraphQL](https://graphql.cn/code/#javascript)+[Sequelize](http://docs.sequelizejs.com/)

##### koa2下使用sequelize（其他：mysql2）

```
const Koa = require('koa');
const router = require('koa-router')();
const Sequelize = require('sequelize');
const app = new Koa();

const mysql = new Sequelize('TEST', 'admin', '123456', {
  dialect: 'mysql',
  host: 'localhost',
  port: 3306,
  timezone: '+08:00' // 时区
});

const User = mysql.define('users', { // 如果使用user，会自动加负数
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true, // 主键
    autoIncrement: true // 自增
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false, // 不允许为空
    comment: '账号'
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    comment: '密码'
  }
});
User.sync(); //如果数据库没有这个表就会新建一个

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// response
router.get('/', async (ctx, next) => {
  const users = await User.findAll(); // 使用model请求数据
  ctx.response.body = users;
});

app.use(router.routes());

app.listen({ port: 3001 }, () => console.log(`🚀 Server ready at http://localhost:3001`));


```

##### koa下使用[GraphQL(一种用于 API 的查询语言)](https://graphql.cn/code/#javascript)，[Apollo](https://www.apollographql.com/docs/apollo-server/)


```
const Koa = require('koa');
const { ApolloServer, gql } = require('apollo-server-koa');
 
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String,
  }
`;
 
// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!'
  }
};
 
const server = new ApolloServer({ typeDefs, resolvers });
 
const app = new Koa();
server.applyMiddleware({ app });
 
app.listen({ port: 3000 }, () =>
  console.log(`🚀 Server ready at http://localhost:3000${server.graphqlPath}`),
);

```

##### 结合使用请查看[code/src](https://github.com/duia-fe/weekly/tree/master/2019-06-21/code)



### 移动端分享

起因：工作中我们会做很多H5页面，有些页面会涉及到项目的活动分享，这时候就需要去对不同的浏览器，不同的客户端进行兼容适配。此次是公司的小伙伴提出来做一个公共的分享，拿来就能用的。

此次分享的主要是思路和部分代码。（在react项目中使用）


如果是微信，需要单独配置。
```
import share from 'xxx/share';
...

if(share.isWeixin()) {
	//在微信内，签名，配置微信分享

}

...

```

主要的js

// share.ts
```
declare const window: Window & { ucbrowser: any, ucweb: any, browser: any }
class Share {
	private ua: string = navigator.userAgent; // 获取浏览器的userAgent判断是什么端
	private UCplatform = [['kWeixin', 'kWeixinFriend', 'kQQ', 'kQZone', 'kSinaWeibo'], ['WechatFriends', 'WechatTimeline', 'QQ', 'QZone', 'SinaWeibo']]; //UC中需要使用的分享配置
	private QQplaform = [1, 8, 4, 3, 11]; //1微信好友，8微信朋友圈，4是QQ好友，3是QQ空间，11是新浪微博
  //判断是不是在微信网页中
	public isWeixin() {
		return /micromessenger/i.test(this.ua);
	}
  //判断是不是在QQ浏览器中，手机QQ中的网页
	public isQQ() {
		return this.ua.split('MQQBrowser/').length > 1 ? true : false;
	}
  //判断是不是在UC浏览器中
	public isUC() {
		return this.ua.split('UCBrowser/').length > 1 ? true : false;
	}
  //这里去做微信配置，配置前需要获取微信签名
	public initWxConfig() {
		return new Promise((resolve, reject) => {
			if (this.isWeixin()) {
				console.log('配置微信');
			}
		})
	}
  //初始调用分享（除微信网页）
	public init(title: string, description: string, img: string, url: string, index: number) {
		return new Promise((resolve, reject) => {
			let os = this.checkOS();
			if (this.isWeixin()) {
				resolve('Weixin');
			}
			if (this.isQQ()) {
				if (window.browser) {
					if (window.browser.app) {
						window.browser.app({
							url, title, description, img_url: img, img_title: title, to_app: this.QQplaform[index], cus_txt: ''
						})
						resolve('QQ');
					}
				} else {
					console.log('暂不支持不是ios和安卓的系统');
					reject();
				}
			}
			if (this.isUC()) {
				let shareData = [title, description, url, this.UCplatform[os][index], '', '', ''];
				if (os === 0) {
					window.ucbrowser.web_share.apply(null, shareData);
					resolve('UC');
				} else if (os === 1) {
					window.ucweb.startRequest("shell.page_share", shareData);
					resolve('UC');
				} else {
					console.log('暂不支持不是ios和安卓的系统');
					reject();
				}
			}
			switch (index) {
				case 0:
				case 1:
				case 2:
					resolve('Link');
					break;

				case 3:
					window.open(`http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(url)}&successurl=${encodeURIComponent(url)}&title=${(title)}&pics=${img}&summary=${description}`);
					resolve('shared');
					break;
				case 4:
					window.open(`http://v.t.sina.com.cn/share/share.php?url=${encodeURIComponent(url)}&title=${title}`);
					resolve('shared');
					break;
				default:
					break;
			}
			// console.log(`复制链接：${url}`);
		})

	}
	/**
	 * checkOS
	 * return 1(ios) | 2(andoid) | 0()other
	 */
	private checkOS() {
		if (/iphone|ipod/i.test(this.ua)) {
			return 0;
		} else if (/android/i.test(this.ua)) {
			return 1;
		} else {
			return 2;
		}
	}
}

export default new Share();
```

在项目中使用share.ts

// index.tsx
```
import React, { Component } from 'react';

import '@/common/styles/share.less';

import share from '@/common/utils/share';

interface IProps {
  dispatch: Dispatch;
}

interface IState {
  showModal: boolean;
  showLink: boolean;
}

class Index extends Component<IProps, IState> {
  constructor(props: IProps, context?: any) {
    super(props, context);
    this.state = {
      showModal: false,
      showLink: false
    };
    this.handleToggleShare = this.handleToggleShare.bind(this);
    this.handleToggleShareLink = this.handleToggleShareLink.bind(this);
    this.handleClickShareModal = this.handleClickShareModal.bind(this);
    this.handleStopPropagation = this.handleStopPropagation.bind(this);
  }
  public handleToggleShare(): void {
    const { showModal } = this.state;
    this.setState({
      showModal: !showModal
    });
  }
  public handleToggleShareLink(): void {
    const { showLink } = this.state;
    this.setState({
      showLink: !showLink
    });
  }
  public handleClickShareModal(): void {
    this.setState({
      showModal: false,
      showLink: false
    });
  }

  public handleStopPropagation(event: React.MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * handleClickShareItem
   */
  public handleClickShareItem(mode: string) {
    console.log(mode);
    switch (mode) {
      case 'weixin':
        console.log('点了微信好友');
        share.init('test', 'des', 'http://asdasd', window.location.href, 0).then(result => {
          console.log(result);
          if (result === 'Link') {
            this.handleToggleShareLink();
          } else {
            this.handleToggleShare();
          }
        });
        break;
      case 'wxpyq':
        console.log('点了微信朋友圈');
        share.init('test', 'des', 'http://asdasd', window.location.href, 1).then(result => {
          console.log(result);
          if (result === 'Link') {
            this.handleToggleShareLink();
          } else {
            this.handleToggleShare();
          }
        });
        break;
      case 'qq':
        console.log('点了QQ好友');
        share.init('test', 'des', 'http://asdasd', window.location.href, 2).then(result => {
          console.log(result);
          if (result === 'Link') {
            this.handleToggleShareLink();
          } else {
            this.handleToggleShare();
          }
        });
        break;
      case 'qzone':
        console.log('点了QQ空间');
        share.init('test', 'des', 'http://asdasd', window.location.href, 3).then(result => {
          console.log(result);
          if (result === 'Link') {
            this.handleToggleShareLink();
          } else {
            this.handleToggleShare();
          }
        });
        break;
      case 'weibo':
        console.log('点了新浪微博');
        share.init('test', 'des', 'http://asdasd', window.location.href, 4).then(result => {
          console.log(result);
          if (result === 'Link') {
            this.handleToggleShareLink();
          } else {
            this.handleToggleShare();
          }
        });
        break;
      default:
        break;
    }
  }

  public render() {
    const { showModal, showLink } = this.state;
    return (
      <div>
        <header className="App-header">
          <button onClick={this.handleToggleShare}>分享</button>
          {showModal && (
            <div className="share-modal" onClick={this.handleClickShareModal}>
              {!showLink ? (
                <div className="share-content" onClick={this.handleStopPropagation}>
                  <div className="share-item" onClick={this.handleClickShareItem.bind(this, 'weixin')}>
                    <div className="share-pic">
                      <img src={require('@/assets/weixin.png')} alt="weixin" />
                    </div>
                    <div className="share-item-text">微信好友</div>
                  </div>
                  <div className="share-item" onClick={this.handleClickShareItem.bind(this, 'wxpyq')}>
                    <div className="share-pic">
                      <img src={require('@/assets/wxpyq.png')} alt="wxpyq" />
                    </div>
                    <div className="share-item-text">微信朋友圈</div>
                  </div>
                  <div className="share-item" onClick={this.handleClickShareItem.bind(this, 'qq')}>
                    <div className="share-pic">
                      <img src={require('@/assets/qq.png')} alt="qq" />
                    </div>
                    <div className="share-item-text">QQ好友</div>
                  </div>
                  <div className="share-item" onClick={this.handleClickShareItem.bind(this, 'qzone')}>
                    <div className="share-pic">
                      <img src={require('@/assets/qzone.png')} alt="qzone" />
                    </div>
                    <div className="share-item-text">QQ空间</div>
                  </div>
                  <div className="share-item" onClick={this.handleClickShareItem.bind(this, 'weibo')}>
                    <div className="share-pic">
                      <img src={require('@/assets/weibo.png')} alt="weibo" />
                    </div>
                    <div className="share-item-text">新浪微博</div>
                  </div>
                </div>
              ) : (
                <div className="share-link">
                  <div className="share-link-wrap" onClick={this.handleStopPropagation}>
                    <div className="share-link-title">长按复制下方链接，去粘贴给好友吧：</div>
                    <div className="share-link-text">{window.location.href}</div>
                  </div>
                  <button className="share-link-button" onClick={this.handleClickShareModal}>
                    取消
                  </button>
                </div>
              )}
            </div>
          )}
        </header>
      </div>
    );
  }
}
export default connect(state => state)(Index);

```


##### 其他
// share.less 样式
```
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  user-select: none;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1;
  animation: fadeIn 0.6s linear forwards;
  .share-content {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 20px;
    background-color: #f1f1f1;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    animation: sildeUp 0.6s ease-in-out forwards;
    overflow: hidden;
    z-index: 1s;
    .share-item {
      margin: 20px;
      .share-pic {
        display: block;
        margin: 0 auto;
        width: 120px;
        height: 120px;
        background-color: #fff;
        border-radius: 50%;
        overflow: hidden;
        img {
          display: block;
          width: 100%;
        }
      }
      .share-item-text {
        padding: 10px 0;
        font-size: 28px;
        color: #999;
        text-align: center;
      }
    }
  }
  .share-link {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #f1f1f1;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
    animation: sildeUp 0.6s ease-in-out forwards;
    color: #666;
    text-align: left;
    z-index: 2;
    .share-link-wrap {
      padding: 30px 40px;
      .share-link-title {
        font-size: 30px;
        color: #333;
      }
      .share-link-text {
        padding: 15px 10px;
        border: 1px solid #ddd;
        user-select: auto;
      }
    }
    .share-link-button {
      display: block;
      width: 100%;
      padding: 20px;
      border: none;
      background-color: #fff;
      font-size: 30px;
      cursor: pointer;
      &:active {
        opacity: 0.8;
      }
    }
  }
}

@keyframes sildeUp {
  0% {
    bottom: -100%;
    opacity: 0.5;
  }
  100% {
    bottom: 0%;
    opacity: 1;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}


```


最后：感谢大家参与，有什么意见和建议，不对的地方欢迎拍砖，谢谢