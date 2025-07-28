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

### 将 Props 传递给组件

1. props 正是 组件的唯一参数！ React 组件函数接受一个参数，一个 props 对象
2. 可以展开 props 对象，将所有属性传递给另一个组件
3. 请克制地使用展开语法。 如果你在所有其他组件中都使用它，那就有问题了。 通常，它表示你应该拆分组件，并将子组件作为 JSX 传递。

```jsx
function App() {
  return (
    <>
      <Clock message="Hello, world!" format="h:mm:ss a" />
      <Clock message="It is now" format="HH:mm:ss" />
    </>
  );
}
```

```jsx
function Clock(props) {
  return (
    <div>
      <header>header info</header>
      <InnerClock {...props} />
    </div>
  );
}
```

```jsx
function InnerClock({ message, format }) {
  return (
    <div>
      <h1>{message}</h1>
      <h2>{format}</h2>
    </div>
  );
}
```

4. 要传递 props，请将它们添加到 JSX，就像使用 HTML 属性一样。
5. 要读取 props，请使用 function Avatar({ person, size }) 解构语法。
6. 你可以指定一个默认值，如 size = 100，用于缺少值或值为 undefined 的 props 。
7. 你可以使用 <Avatar {...props} /> JSX 展开语法转发所有 props，但不要过度使用它！
8. 像 <Card><Avatar /></Card> 这样的嵌套 JSX，将被视为 Card 组件的 children prop。
9. Props 是只读的时间快照：每次渲染都会收到新版本的 props。
10. 你不能改变 props。当你需要交互性时，你可以设置 state。

### 条件渲染

1. 在 JSX 里，React 会将 false 视为一个“空值”，就像 null 或者 undefined，这样 React 就不会在这里进行任何渲染。

::: tip
切勿将数字放在 && 左侧.

JavaScript 会自动将左侧的值转换成布尔类型以判断条件成立与否。然而，如果左侧是 0，整个表达式将变成左侧的值（0），React 此时则会渲染 0 而不是不进行渲染。

例如，一个常见的错误是 messageCount && <p>New messages</p>。其原本是想当 messageCount 为 0 的时候不进行渲染，但实际上却渲染了 0。

为了更正，可以将左侧的值改成布尔类型：messageCount > 0 && <p>New messages</p>。
:::

### 渲染列表

1. 这些 key 会告诉 React，每个组件对应着数组里的哪一项，所以 React 可以把它们匹配起来。这在数组项进行移动（例如排序）、插入或删除等操作时非常重要。一个合适的 key 可以帮助 React 推断发生了什么，从而得以正确地更新 DOM 树。
2. 为每个列表项显示多个 DOM 节点：如果你想让每个列表项都输出多个 DOM 节点而非一个的话，该怎么做呢？Fragment 语法的简写形式 <> </> 无法接受 key 值，所以你只能要么把生成的节点用一个 `<div`> 标签包裹起来，要么使用长一点但更明确的 `<Fragment>` 写法：

```jsx
import { Fragment } from "react";

const listItems = people.map(person => (
  <Fragment key={person.id}>
    <h1>{person.name}</h1>
    <p>{person.bio}</p>
  </Fragment>
));
```

### 保持组件纯粹

1. 纯函数：

在计算机科学中（尤其是函数式编程的世界中），纯函数 通常具有如下特征：

- **只负责自己的任务。** 它不会更改在该函数调用前就已存在的对象或变量。
- **输入相同，则输出相同。** 给定相同的输入，纯函数应总是返回相同的结果。

2. React 提供了 “严格模式”，在严格模式下开发时，它将会调用每个组件函数两次。通过重复调用组件函数，严格模式有助于找到违反这些规则的组件。
3. 严格模式在生产环境下不生效，因此它不会降低应用程序的速度。如需引入严格模式，你可以用 <React.StrictMode> 包裹根组件。一些框架会默认这样做。
4. 函数式编程在很大程度上依赖于纯函数，但 某些事物 在特定情况下不得不发生改变。这是编程的要义！这些变动包括更新屏幕、启动动画、更改数据等，它们被称为 副作用。它们是 “额外” 发生的事情，与渲染过程无关。
5. 在 React 中，副作用通常属于 事件处理程序。事件处理程序是 React 在你执行某些操作（如单击按钮）时运行的函数。即使事件处理程序是在你的组件 内部 定义的，它们也不会在渲染期间运行！ 因此事件处理程序无需是纯函数。
6. 如果你用尽一切办法，仍无法为副作用找到合适的事件处理程序，你还可以调用组件中的 useEffect 方法将其附加到返回的 JSX 中。这会告诉 React 在渲染结束后执行它。然而，这种方法应该是你最后的手段。

## 添加交互

1. 在 React 中，随时间变化的数据被称为状态（state），可以用 useState Hook 为组件添加状态。
2. 与普通 JavaScript 变量不同，React 状态的行为更像一个快照。设置它并不改变你已有的状态变量，而是触发一次重新渲染。
3. 状态可以持有任何类型的 JavaScript 值，包括对象。但你不应该直接改变你在 React 状态中持有的对象和数组。相反，当你想更新一个对象和数组时，你需要创建一个新的对象（或复制现有的对象），然后用这个副本来更新状态。
4. 如果在代码中复制对象感觉乏味，可以使用 `Immer` 之类的库来减少重复代码

```jsx
import { useImmer } from "use-immer";

const [person, updatePerson] = useImmer({
  name: "Niki de Saint Phalle",
  artwork: {
    title: "Blue Nana",
    city: "Hamburg",
    image: "https://i.imgur.com/Sd1AgUOm.jpg"
  }
});

function handleNameChange(e) {
  updatePerson(draft => {
    draft.name = e.target.value;
  });
}
```

5. 数组是另一种可以存在状态中的可变 JavaScript 对象，应将其视为只读。就像对象一样，当你想更新存在状态中的数组时，你需要创建一个新数组（或者复制现有数组），然后用新数组来更新状态。
6. 如果在代码中复制数组感觉乏味，可以使用 Immer 之类的库来减少重复代码

```jsx
import { useImmer } from "use-immer";

const [people, updatePeople] = useImmer([
  { name: "Niki de Saint Phalle", art: "Blue Nana" },
  {
    name: "Henri Matisse",
    art: "The Red Fish, The Blue Fish, The Yellow Fish"
  },
  { name: "Pablo Picasso", art: "The Old Guitarist" }
]);

const [list, updateList] = useImmer(initialList);

function handleAddPerson(person) {
  updatePeople(draft => {
    draft.push(person);
  });
}

function handleToggle(artworkId, nextSeen) {
  updateList(draft => {
    const artwork = draft.find(a => a.id === artworkId);
    artwork.seen = nextSeen;
  });
}
```

### 响应事件

1. 在 React 中所有事件都会传播，除了 `onScroll`，它仅适用于你附加到的 JSX 标签。
2. 阻止一个事件到达父组件，需要调用 `e.stopPropagation()`
3. 极少数情况下，你可能需要捕获子元素上的所有事件，即便它们阻止了传播。例如，你可能想对每次点击进行埋点记录，传播逻辑暂且不论。那么你可以通过在事件名称末尾添加 Capture 来实现这一点

每个事件分三个阶段传播：

- 它向下传播，调用所有的 onClickCapture 处理函数。
- 它执行被点击元素的 onClick 处理函数。
- 它向上传播，调用所有的 onClick 处理函数。

```jsx
function App() {
  return (
    <div
      onClickCapture={() => {
        /* 这会首先执行 */
      }}
    >
      <button onClick={e => e.stopPropagation()} />
      <button onClick={e => e.stopPropagation()} />
    </div>
  );
}
```

4. `e.preventDefault()` 阻止默认行为。例如，阻止链接跳转或阻止表单提交。
5. Hooks ——以 use 开头的函数——只能在组件或自定义 Hook 的最顶层调用。 你不能在条件语句、循环语句或其他嵌套函数内调用 Hook。Hook 是函数，但将它们视为关于组件需求的无条件声明会很有帮助。在组件顶部 “use” React 特性，类似于在文件顶部“导入”模块。

### state 如同一张快照

1. 一个 state 变量的值永远不会在一次渲染的内部发生变化，即使其事件处理函数的代码是异步的。

### 把一系列 state 更新加入到队列

1. React 会对 state 更新进行批处理

### 更新 state 中的对象

1. 由 Immer 提供的 draft 是一种特殊类型的对象，被称为 Proxy，它会记录你用它所进行的操作。这就是你能够随心所欲地直接修改对象的原因所在！从原理上说，Immer 会弄清楚 draft 对象的哪些部分被改变了，并会依照你的修改创建出一个全新的对象。
2. 为什么在 React 中不推荐直接修改 state？

- **表象**：因为 React 需要使用 state 来决定何时重新渲染组件。如果直接修改 state，React 就无法得知 state 已经发生了变化，也就无法重新渲染组件了。
- **调试**：如果你使用 console.log 并且不直接修改 state，你之前日志中的 state 的值就不会被新的 state 变化所影响。这样你就可以清楚地看到两次渲染之间 state 的值发生了什么变化
- **优化**：React 常见的 优化策略 依赖于如果之前的 props 或者 state 的值和下一次相同就跳过渲染。如果你从未直接修改 state ，那么你就可以很快看到 state 是否发生了变化。如果 prevObj === obj，那么你就可以肯定这个对象内部并没有发生改变。
- **新功能**：我们正在构建的 React 的新功能依赖于 state 被 像快照一样看待 的理念。如果你直接修改 state 的历史版本，可能会影响你使用这些新功能。
- **需求变更**：有些应用功能在不出现任何修改的情况下会更容易实现，比如实现撤销/恢复、展示修改历史，或是允许用户把表单重置成某个之前的值。这是因为你可以把 state 之前的拷贝保存到内存中，并适时对其进行再次使用。如果一开始就用了直接修改 state 的方式，那么后面要实现这样的功能就会变得非常困难。
- **更简单的实现**：React 并不依赖于 mutation ，所以你不需要对对象进行任何特殊操作。它不需要像很多“响应式”的解决方案一样去劫持对象的属性、总是用代理把对象包裹起来，或者在初始化时做其他工作。这也是为什么 React 允许你把任何对象存放在 state 中——不管对象有多大——而不会造成有任何额外的性能或正确性问题的原因。

### 更新 state 中的数组

1. 在 React 中，数组是可变的，但你不应该直接修改数组。相反，你需要创建一个新数组（或者复制现有数组），然后用新数组来更新状态。
2. 如果在代码中复制数组感觉乏味，可以使用 Immer 之类的库来减少重复代码。

## 状态管理

1. Reducer 帮助你合并组件的状态更新逻辑。Context 帮助你将信息深入传递给其他组件。可以将 reducers 和 context 组合在一起使用，以管理复杂应用的状态。

## 选择 state 结构

### 构建 state 的原则

1. **合并关联的 state**。如果你总是同时更新两个或更多的 state 变量，请考虑将它们合并为一个单独的 state 变量。
2. **避免互相矛盾的 state**。当 state 结构中存在多个相互矛盾或“不一致”的 state 时，你就可能为此会留下隐患。应尽量避免这种情况。
3. **避免冗余的 state**。如果你能在渲染期间从组件的 props 或其现有的 state 变量中计算出一些信息，则不应将这些信息放入该组件的 state 中。
4. **避免重复的 state**。当同一数据在多个 state 变量之间或在多个嵌套对象中重复时，这会很难保持它们同步。应尽可能减少重复。
5. **避免深度嵌套的 state**。深度分层的 state 更新起来不是很方便。如果可能的话，最好以扁平化方式构建 state。

## 在组件间共享状态

### 受控组件和非受控组件

1. 通常我们把包含“不受控制”状态的组件称为“非受控组件”。例如，最开始带有 isActive 状态变量的 Panel 组件就是不受控制的，因为其父组件无法控制面板的激活状态。
2. 相反，当组件中的重要信息是由 props 而不是其自身状态驱动时，就可以认为该组件是“受控组件”。这就允许父组件完全指定其行为。最后带有 isActive 属性的 Panel 组件是由 Accordion 组件控制的。

### 在组件间共享状态

1. 对于每个独特的状态，都应该存在且只存在于一个指定的组件中作为 state。这一原则也被称为拥有 “可信单一数据源”。它并不意味着所有状态都存在一个地方——对每个状态来说，都需要一个特定的组件来保存这些状态信息。你应该 将状态提升 到公共父级，或 将状态传递 到需要它的子级中，而不是在组件之间复制共享的状态。

## 对 state 进行保留和重置

### 状态与渲染树中的位置相关

1. 当向一个组件添加状态时，那么可能会认为状态“存在”在组件内。但实际上，状态是由 React 保存的。React 通过组件在渲染树中的位置将它保存的每个状态与正确的组件关联起来。
2. 只有当在树中相同的位置渲染相同的组件时，React 才会一直保留着组件的 state。
3. 只要一个组件还被渲染在 UI 树的相同位置，React 就会保留它的 state。 如果它被移除，或者一个不同的组件被渲染在相同的位置，那么 React 就会丢掉它的 state。

### 相同位置的相同组件会使得 state 被保留下来

1. 对 React 来说重要的是组件在 UI 树中的位置,而不是在 JSX 中的位置！

```jsx
import { useState } from "react";

export default function App() {
  const [isFancy, setIsFancy] = useState(false);
  if (isFancy) {
    return (
      <div>
        <Counter isFancy={true} />
        <label>
          <input
            type="checkbox"
            checked={isFancy}
            onChange={e => {
              setIsFancy(e.target.checked);
            }}
          />
          使用好看的样式
        </label>
      </div>
    );
  }
  return (
    <div>
      <Counter isFancy={false} />
      <label>
        <input
          type="checkbox"
          checked={isFancy}
          onChange={e => {
            setIsFancy(e.target.checked);
          }}
        />
        使用好看的样式
      </label>
    </div>
  );
}

function Counter({ isFancy }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(false);

  let className = "counter";
  if (hover) {
    className += " hover";
  }
  if (isFancy) {
    className += " fancy";
  }

  return (
    <div
      className={className}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <h1>{score}</h1>
      <button onClick={() => setScore(score + 1)}>加一</button>
    </div>
  );
}
```

::: tip
你可能以为当你勾选复选框的时候 state 会被重置，但它并没有！这是因为 **两个 <Counter /> 标签被渲染在了相同的位置**。 React 不知道你的函数里是如何进行条件判断的，它只会“看到”你返回的树。在这两种情况下，App 组件都会返回一个包裹着 <Counter /> 作为第一个子组件的 div。这就是 React 认为它们是 **同一个 <Counter />** 的原因。
:::

### 相同位置的不同组件会使 state 重置

1. 当你在相同位置渲染不同的组件时，组件的整个子树都会被重置

```jsx
import { useState } from "react";

export default function App() {
  const [isFancy, setIsFancy] = useState(false);
  return (
    <div>
      {isFancy ? (
        <div>
          <Counter isFancy={true} />
        </div>
      ) : (
        <section>
          <Counter isFancy={false} />
        </section>
      )}
      <label>
        <input
          type="checkbox"
          checked={isFancy}
          onChange={e => {
            setIsFancy(e.target.checked);
          }}
        />
        使用好看的样式
      </label>
    </div>
  );
}

function Counter({ isFancy }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(false);

  let className = "counter";
  if (hover) {
    className += " hover";
  }
  if (isFancy) {
    className += " fancy";
  }

  return (
    <div
      className={className}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <h1>{score}</h1>
      <button onClick={() => setScore(score + 1)}>加一</button>
    </div>
  );
}
```

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
