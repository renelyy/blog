# CSS 常见面试题

## 1. 实现水平垂直居中的方式？

### 1.1 使用 Flexbox 布局（推荐）

::: tip
使用 Flexbox 布局可以很容易地实现水平垂直居中，只需要将父容器设置为 Flex 布局，并设置 justify-content 和 align-items 属性为 center 即可。
:::

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### 1.2 使用 Grid 布局

::: tip

使用 Grid 布局也可以实现水平垂直居中，将父容器设置为 Grid 布局，并设置 grid-template-rows 和 grid-template-columns 属性为 1fr，然后将要居中的元素放在网格的中心即可。
:::

```css
.container {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
}
.item {
  justify-self: center;
  align-self: center;
}
```

### 1.3 使用绝对定位和 transform

::: tip
将要居中的元素设置为绝对定位，然后将 left、right、top、bottom 属性都设置为 0，并将 transform 属性设置为 translate(-50%, -50%)。
:::

```css
.container {
  position: relative;
}
.item {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
```

### 1.3 使用绝对定位和 margin: auto

```css
.container {
  position: relative;
  height: 400px;
  width: 400px;
}
.item {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100px;
  height: 100px;
  margin: auto;
}
```

## 2. 常用伪元素有哪一些？

常用的伪元素有以下几种：

### 2.1 `::before`：在元素的内容前插入一个虚拟元素。

### 2.2 `::after`：在元素的内容后插入一个虚拟元素。

### 2.3 `::first-letter`：选择元素的第一个字母或第一个汉字。

### 2.4 `::first-line`：选择元素的第一行。

### 2.5 `::selection`：选择被用户选中的文本部分。

### 2.6 `::placeholder`：选择表单元素的占位符文本。

这些伪元素在 CSS 中都以双冒号 (\:\:) 开头。使用伪元素可以为元素添加一些额外的样式效果，使页面的布局更加灵活，视觉效果更加丰富。

## 3. 移动端如何适配不同屏幕尺寸？

移动端适配不同屏幕尺寸是一个非常重要的问题，因为现在移动设备的屏幕尺寸和分辨率非常多样化，如果不进行适配，页面可能会出现错位、缩放等问题，影响用户体验。以下是一些常用的适配方法：

### 3.1 使用 Viewport 标签

Viewport 是移动设备浏览器中的一种元标签，它能够控制页面的显示区域和缩放比例。在 head 标签中加入如下代码即可开启 viewport：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

其中，`width=device-width`表示宽度等于设备宽度，`initial-scale=1.0` 表示初始缩放比例为 `1.0`。

### 3.2 使用 CSS 媒体查询

通过 CSS 媒体查询可以根据设备屏幕的宽度不同，为不同屏幕宽度设置不同的样式。比如可以设置一个@media 规则，来针对小屏幕设备设置样式：

```css
@media (max-width: 768px) {
  /* styles for small screens */
}
```

这里 `max-width` 表示屏幕宽度不大于 `768px` 时应用该样式。

### 3.3 使用相对单位

在设计移动端页面时，应该尽量避免使用绝对单位（如 `px`），而是使用相对单位（如 `em`、`rem`、`vw` 等）。相对单位可以根据屏幕尺寸动态调整，保证页面的自适应性。

### 3.4 使用弹性盒子布局（Flexbox）

Flexbox 是一种现代的 CSS 布局方式，它可以帮助我们更容易地实现自适应布局。Flexbox 可以根据屏幕尺寸和内容自动调整元素的位置和大小，从而适应不同的屏幕尺寸。

> 总结：综上所述，移动端适配不同屏幕尺寸需要使用多种方法结合起来，以确保页面可以在不同的设备上呈现出良好的效果和用户体验。

## 4. ★★ 弹性布局，一行两列，一列固定宽，如何实现？

弹性布局（Flexbox）是一种方便灵活的布局方式，可以轻松实现一行两列，其中一列具有固定宽度的效果。下面介绍几种实现方法：

### 4.1 使用 flex 属性

```html
<div class="container">
  <div class="fixed-column">固定宽度的列</div>
  <div class="flexible-column">自适应宽度的列</div>
</div>
```

```css
.container {
  display: flex;
}

.fixed-column {
  width: 200px;
  background-color: #ccc;
}

.flexible-column {
  flex: 1;
  background-color: #eee;
}
```

解释一下上述代码：

1. `.container` 是包含两列的父元素，设置 `display: flex` 表示使用弹性布局。
2. `.fixed-column` 是具有固定宽度的列，使用 `width` 属性设置宽度，`background-color` 属性设置背景色。
3. `.flexible-column` 是自适应宽度的列，使用 `flex: 1` 表示自动填充剩余空间，`background-color` 属性设置背景色。

### 4.2 使用 flex-basis 属性

```html
<div class="container">
  <div class="fixed-column">固定宽度的列</div>
  <div class="flexible-column">自适应宽度的列</div>
</div>
```

```css
.container {
  display: flex;
}

.fixed-column {
  flex-basis: 200px;
  background-color: #ccc;
}

.flexible-column {
  flex: 1;
  background-color: #eee;
}
```

解释一下上述代码：

1. `.container` 是包含两列的父元素，设置 `display: flex` 表示使用弹性布局。
2. `.fixed-column` 是具有固定宽度的列，使用 `flex-basis` 属性设置宽度，`background-color` 属性设置背景色。
3. `.flexible-column` 是自适应宽度的列，使用 `flex: 1` 表示自动填充剩余空间，`background-color` 属性设置背景色。

### 4.3 使用 margin-left 属性

```html
<div class="container">
  <div class="fixed-column">固定宽度的列</div>
  <div class="flexible-column">自适应宽度的列</div>
</div>
```

```css
.container {
  display: flex;
}

.fixed-column {
  width: 200px;
  background-color: #ccc;
}

.flexible-column {
  margin-left: 200px;
  background-color: #eee;
}
```

解释一下上述代码：

1. `.container` 是包含两列的父元素，设置 `display: flex` 表示使用弹性布局。
2. `.fixed-column` 是具有固定宽度的列，使用 `width` 属性设置宽度，`background-color` 属性设置背景色。
3. `.flexible-column` 是自适应宽度的列

::: warning 重复出现的相似问题

1. 菜单左中右布局，两边定宽，中间自适应，说一下有几种实现方式

:::

## 5. ★★ flex：1  包含哪三种属性

::: tip
flex: 1; 是一个 CSS 简写属性，用于设置弹性盒子容器的子项在分配额外空间时的分配比例，用于设置弹性容器中的子项的三个相关属性：flex-grow、flex-shrink 和 flex-basis。具体来说，flex: 1; 表示：
:::

### 5.1 flex-grow

表示子项的放大比例，默认值为 0，表示不放大。如果所有子项的 `flex-grow` 属性都为 1，则它们平分剩余空间。

### 5.2 flex-shrink

表示子项的缩小比例，默认值为 1，表示当空间不足时，子项将等比例缩小。如果所有子项的 `flex-shrink` 属性都为 0，则它们不会缩小。

### 5.3 flex-basis

表示子项在分配多余空间之前的初始大小，默认值为 `auto`，表示由子项的内容决定大小。可以设置为一个具体的长度值或百分比。

这个属性通常用于创建弹性容器，并让子项自动填充容器的可用空间。当设置 `flex: 1`; 时，子项将会自动平分剩余空间，并在空间不足时等比例缩小，以适应容器的尺寸变化。

::: warning 重复出现的相似问题

1. flex 1 是代表什么意思？分别有哪些属性?

:::

## 6. 虚拟列表怎么实现?

::: tip
虚拟列表（Virtual List）是指只在当前可见区域内渲染数据的列表，而不是一次性渲染全部数据。这种技术可以大幅提高列表的渲染性能，特别是当列表数据量非常大时。
:::

实现虚拟列表的一般步骤如下：

1. 首先确定每个列表项的高度或宽度（如果是水平滚动），这可以通过测量样式或计算得出。
2. 然后计算可见区域可以容纳的列表项数量。这可以通过可见区域的高度或宽度除以每个列表项的高度或宽度得出。
3. 监听滚动事件，并根据当前滚动位置动态计算当前可见区域所需要的数据。
4. 渲染当前可见区域的数据，并在滚动时动态更新渲染的内容。

下面是一个示例代码实现，以垂直滚动为例：

```js
const container = document.getElementById('container');
const itemHeight = 50; // 列表项高度
const visibleCount = Math.ceil(container.clientHeight / itemHeight); // 可见区域列表项数量
let startIndex = 0; // 当前可见区域的起始索引

container.addEventListener('scroll', () => {
  const scrollTop = container.scrollTop;
  startIndex = Math.floor(scrollTop / itemHeight);
  renderItems();
});

function renderItems() {
  const listData = getListData(startIndex, startIndex + visibleCount);
  const itemsHtml = listData
    .map(item => {
      return `<div style="height:${itemHeight}px">${item}</div>`;
    })
    .join('');
  container.innerHTML = itemsHtml;
}

function getListData(startIndex, endIndex) {
  // 从数据源获取指定范围内的数据
  // ...
  return data.slice(startIndex, endIndex);
}

// 初始化渲染第一页数据
renderItems();
```

## 7. css 三列等宽布局如何实现?

## 8. BFC 是什么? 哪些属性可以构成一个 BFC 呢?

## 9. postion 属性大概讲一下, static 是什么表现? static 在文档流里吗?

## 10. flex 布局 11.各种 css 属性

## 11. 什么是重绘？什么是回流？如何减少回流？
重绘：当元素的样式发生改变，但是不影响布局时，浏览器会重新渲染元素，这个过程就是重绘。

回流：当元素的布局发生改变，浏览器需要重新计算元素的位置和大小，这个过程就是回流。

减少回流：
1. 避免频繁操作样式，最好一次性修改多个样式。
2. 避免使用 table 布局，因为 table 布局会导致整个表格回流。
3. 避免使用 position 属性为 absolute 或 fixed 的元素，因为它们脱离了文档流，会导致其他元素的回流。
4. 避免使用 visibility 属性为 hidden 的元素，因为它会导致元素及其子元素的回流。
5. 避免使用 transform 或 animation 等动画属性，因为它们会导致元素的回流。
6. 避免使用 float 布局，因为它会导致元素的回流。
7. 避免使用 inline-block 布局，因为它会导致元素的回流。
8. 避免使用 iframe 布局，因为它会导致元素的回流。
9. 避免使用 javascript 操作 DOM，因为它会导致元素的回流。
10. 避免使用 javascript 操作样式，因为它会导致元素的回流。

::: tip 注意

1. 重绘和回流是浏览器渲染机制的一部分，了解它们的原理和影响是非常重要的。
2. 减少回流和重绘的操作可以显著提高页面的渲染性能。

:::


