## typescript 分享

#### 1. 基础类型（常用的类型）

- boolean
- number
- string
- Array

#### 2. 变量声明

- 作用域规则
- var
- let
- const

#### 3. 接口的使用

```typescript
interface IState {
  // 轮播banner
  banner: Array<{ img: string; other: Ibanner }>;
  // 轮播图选中
  activeIndex: number;
  // 分类标签
  tags: Array<{ id: number; name: string }>;
  // 选中标签
  tagsActive: number;
  // 电台帖列表
  topicList: any[];
  // 关注链接
  links: Array<{ link: string; icon: string }>;
  // 电台分页信息
  topicInfo: {
    state: boolean; // 是否显示加载更多
    currentPage: number; // 当前页数
    totalPage: number; // 总页数
    page: number; // 每页条数
  };
  // 对应的微信二维码
  group: {
    title: string; // 标题
    wxLogo: string; // 二维码
    name: string;
  };
  // 播放状态
  audioState: boolean;
}
```

#### 4. 类的使用以及继承(es6 语法)

```typescript
class Index extends Radio<IState> {
  public props: any;
  protected video: any;
  constructor(props: any) {
    super(props, {
      banner: [],
      tags: [],
      topicList: [],
      activeIndex: 0,
      links: [],
      tagsActive: 0,
      topicInfo: {
        state: false,
        currentPage: 1,
        totalPage: 0,
        page: 10
      },
      group: { title: '', wxLogo: '', name: '' },
      audioState: false
    });
    this.$LoadState = true;
    document.title = '电台中心';
  }
}
```

#### 5. 函数接口的定义

```typescript
interface IPorps {
  touch?: (type: Ttouch, index: number, other?: any) => void; // 回调函数
}
```

#### 6. 泛型的使用

```typescript
function factory<Itype>($name: string, initState: Itype) {
  return (state = initState, { type, data }: { type: string; data: Itype }): Itype => {
    if (type === $name) {
      state = { ...state, ...data };
    }
    return state;
  };
}
```

#### 7. 高级类型

- 交叉类型

```typescript
function extend<T, U>(first: T, second: U): T & U {
  let result = <T & U>{};
  for (let id in first) {
    (<any>result)[id] = (<any>first)[id];
  }
  for (let id in second) {
    if (!result.hasOwnProperty(id)) {
      (<any>result)[id] = (<any>second)[id];
    }
  }
  return result;
}
```

- 联合类型

```typescript
function padLeft(value: string, padding: string | number) {
  // ...
}
```

#### 9. 命名空间

```typescript
namespace ITYPE {
  export interface Igls {
    loading_state: boolean;
  }
  export interface IuserInfo {
    userId?: number;
  }
  export interface Iradio {
    id?: number;
    cover?: string;
  }
}
const stores: object = {
  gls: factory<ITYPE.Igls>('gls', { loading_state: true }),
  userInfo: factory<ITYPE.IuserInfo>('userInfo', {}),
  radio: factory<ITYPE.Iradio>('radio', {})
};
```

---

分享：`何宇`
