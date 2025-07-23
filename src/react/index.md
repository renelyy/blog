# React

## 快速入门

### 使用 Hook

Hook 比普通函数更为严格。你只能在你的组件（或其他 Hook）的 顶层 调用 Hook。如果你想在一个条件或循环中使用 useState，请提取一个新的组件并在组件内部使用它。

### 组件间共享数据

“状态提升”。通过向上移动 state，可以实现在组件间共享数据。

要从多个子组件收集数据，或让两个子组件相互通信，请改为在其父组件中声明共享 state。父组件可以通过 props 将该 state 传回给子组件。这使子组件彼此同步并与其父组件保持同步。

## 安装

### 启动一个新的 React 项目

1. Next.js
2. Remix
3. Gatsby
4. Expo

### 将 React 添加到已有项目中

1. 在现有网站的子路由中使用 React
2. 在现有页面的一部分中使用 React
3. 在现有的原生移动应用中使用 React Native

## 描述 UI

### 第一个组件

1. React 组件是一段可以 使用标签进行扩展 的 JavaScript 函数。
2. React 组件是常规的 JavaScript 函数，但 组件的名称必须以大写字母开头，否则它们将无法运行！
3. 组件可以渲染其他组件，但是 请不要嵌套他们的定义：🔴 永远不要在组件中定义组件

### 组件的导入与导出

1. 为了减少在默认导出和具名导出之间的混淆，一些团队会选择只使用一种风格（默认或者具名），或者禁止在单个文件内混合使用。这因人而异，选择最适合你的即可！

### 使用 JSX 书写标签语言

1. JSX 是 JavaScript 语法扩展，可以让你在 JavaScript 文件中书写类似 HTML 的标签。
2. 为什么 React 将标签和渲染逻辑耦合在一起

- 将一个按钮的渲染逻辑和标签放在一起可以确保它们在每次编辑时都能保持互相同步。反之，彼此无关的细节是互相隔离的，例如按钮的标签和侧边栏的标签。这样我们在修改其中任意一个组件时会更安全。
- JSX 是一个 JavaScript 语法扩展，而不是模板语言。你可以使用 JavaScript 表达式，例如变量和函数调用，来构建你的标签。这使你可以在渲染逻辑中直接使用应用的状态和函数。

3. JSX 与 HTML 有什么区别

- JSX 使用驼峰式命名法来定义属性名称，例如 `class` 变为 `className`，`tabindex` 变为 `tabIndex`。
- 自闭合标签必须以斜线结尾，例如 `<img />` 或 `<br />`。
- JSX 标签必须闭合，例如 `<div></div>` 或 `<div />`。

4. JSX and React 是相互独立的 东西。但它们经常一起使用，但你 可以 单独使用它们中的任意一个，JSX 是一种语法扩展，而 React 则是一个 JavaScript 的库。
5. JSX 规则

- 只能返回一个根元素
  - 为什么多个 JSX 标签需要被一个父元素包裹？
    - JSX 虽然看起来很像 HTML，但在底层其实被转化为了 JavaScript 对象，你不能在一个函数中返回多个对象，除非用一个数组把他们包装起来。这就是为什么多个 JSX 标签必须要用一个父元素或者 Fragment 来包裹。
- 标签必须闭合
- 使用驼峰式命名法给 所有大部分属性命名！
  - 由于历史原因，aria-_ 和 data-_ 属性是以带 - 符号的 HTML 格式书写的。

## Hooks

### useState

1. **作用**
   `useState` 是一个 Hook，它允许你在函数组件中添加 state 状态。

2. **使用**

```js
const [state, setState] = useState(initialState);
```

### useEffect

1. **作用**

`useEffect` 是一个 Hook，它允许你在函数组件中执行副作用操作。

2. **使用**

```js
useEffect(() => {
  // 在组件挂载和卸载时执行

  return () => {
    // 在组件卸载时执行
  };
}, [dependencies]);
```

### useContext

1. **作用**

`useContext` 是一种无需通过组件传递 props 而可以直接在组件树中传递数据的技术。它是通过创建 provider 组件使用，通常还会创建一个 Hook 以在子组件中使用该值。

2. **使用**

```js
const value = useContext(MyContext);
```

### useReducer

1. **作用**

`useReducer` 是 `useState` 的替代方案。它适用于那些 state 逻辑较复杂且包含多个子值的场景。

2. **使用**

```js
import { useReducer } from "react";

interface State {
  count: number;
}

type CounterAction =
  | { type: "reset" }
  | { type: "setCount", count: State["count"] };

const initialState: State = {
  count: 0
};

function stateReducer(state: State, action: CounterAction): State {
  switch (action.type) {
    case "reset":
      return initialState;
    case "setCount":
      return { ...state, count: action.count };
    default:
      throw new Error();
  }
}

export default function Timer() {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const reset = () => dispatch({ type: "reset" });
  const addFive = () => dispatch({ type: "setCount", count: state.count + 5 });

  return (
    <div>
      <p>{state.count}</p>
      <button onClick={reset}>Reset</button>
      <button onClick={addFive}>Add 5</button>
    </div>
  );
}
```

### useCallback

1. **作用**

`useCallback` 是一个 Hook，它允许你在函数组件中记忆一个回调函数。
`useCallback` 会在第二个参数中传入的依赖项保持不变的情况下，为函数提供相同的引用。

2. **使用**

```js
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### useMemo

1. **作用**

`useMemo` 会从函数调用中创建/重新访问记忆化值，只有在第二个参数中传入的依赖项发生变化时，才会重新运行该函数。

2. **使用**

```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

### useRef

1. **作用**

`useRef` 是一个 Hook，它允许你在函数组件中访问 DOM 元素或保存一个可变的值。

2. **使用**

```js
const inputEl = useRef(null);
```

### useImperativeHandle

1. **作用**

`useImperativeHandle` 是一个 Hook，它允许你在函数组件中暴露一个 ref 给父组件。

2. **使用**

```js
useImperativeHandle(ref, () => ({
  focus: () => {
    inputEl.current.focus();
  }
}));
```

### useLayoutEffect

1. **作用**

`useLayoutEffect` 是一个 Hook，它允许你在函数组件中执行副作用操作，并在 DOM 更新后同步执行。

2. **使用**

```js
useLayoutEffect(() => {
  // 在 DOM 更新后同步执行
  return () => {
    // 在 DOM 更新后同步执行
  };
}, [dependencies]);
```

### useDebugValue

1. **作用**

`useDebugValue` 是一个 Hook，它允许你在 React DevTools 中显示自定义 Hook 的标签。

2. **使用**

```js
useDebugValue(value);
```
