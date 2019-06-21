### 分享使用GraphQL+Sequelize

[Sequelize](http://docs.sequelizejs.com/)

[GraphQL(一种用于 API 的查询语言)](https://graphql.cn/code/#javascript)

[Apollo](https://www.apollographql.com/docs/apollo-server/)


### 移动端分享

如果是微信，需要单独配置。

share.ts
```
declare const window: Window & { ucbrowser: any, ucweb: any, browser: any }
class Share {
	private ua: string = navigator.userAgent;
	private UCplatform = [['kWeixin', 'kWeixinFriend', 'kQQ', 'kQZone', 'kSinaWeibo'], ['WechatFriends', 'WechatTimeline', 'QQ', 'QZone', 'SinaWeibo']];
	private QQplaform = [1, 8, 4, 3, 11]; //1微信好友，8微信朋友圈，4是QQ好友，3是QQ空间，11是新浪微博
	public isWeixin() {
		return /micromessenger/i.test(this.ua);
	}
	public isQQ() {
		return this.ua.split('MQQBrowser/').length > 1 ? true : false;
	}
	public isUC() {
		return this.ua.split('UCBrowser/').length > 1 ? true : false;
	}
	public initWxConfig() {
		return new Promise((resolve, reject) => {
			if (this.isWeixin()) {
				console.log('配置微信');
			}
		})
	}
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

index.tsx
```
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
// import { Link } from 'react-router-dom';

import '@/common/styles/share.less';
// import logo from '../logo.svg';

import betaAction from '@/store/action/beta';
import share from '@/common/utils/share';

interface IProps {
  beta: any;
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
    this.handleClick = this.handleClick.bind(this);
    this.handleToggleShare = this.handleToggleShare.bind(this);
    this.handleToggleShareLink = this.handleToggleShareLink.bind(this);
    this.handleClickShareModal = this.handleClickShareModal.bind(this);
    this.handleStopPropagation = this.handleStopPropagation.bind(this);
  }

  public handleClick(): void {
    this.props.dispatch(betaAction.betaChange());
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
    const { beta } = this.props;
    const { showModal, showLink } = this.state;
    console.log(beta);
    return (
      <div>
        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <Link className="App-link" to="/home">
            link
          </Link>
          <button onClick={this.handleClick}>change</button>
          <div>beta:{beta.text}</div> */}
      
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