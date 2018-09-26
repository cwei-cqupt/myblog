---
title: tkinter学习之路
date: 2018-08-13 16:32:55
categories: 技术
tags: ['Python','tkinter']
---

最近由于工作需要，自学了tkinter的一些东西，在使用过程中遇到了一些问题，现记录下来。

<!-- more -->

# tkinter的使用示例代码

```python
import Tkinter as tk

window = tk.TK()
label = tk.Label(window, text='Hello world')
label.pack()
window.mainloop()

```

当然了，这段代码是最最简单的几行代码（而且很容易运行了看不到效果，因为gui窗口太小了找不到，我当时
就没看到，还以为是运行出错了，又没看到错误提示。唉）

# tkinter实现动画效果

## tkinter运行的几个状态

### 创建

```python
window = tk.Tk()
label = tk.Label(window, text='hello world')
```
顾名思义，这个阶段是创建各个组件以及进行各种绑定的阶段，在这个阶段不会生成gui的窗口。

在这个阶段需要做的有：gui组件的创建，事件监听的绑定，动画效果的创建

### 布局

作为一个jser，还是更加喜欢用布局这个词

```python
label.pack() || lable.grid() || label.place()
```

这三个函数分别对应三种不同的布局方式，可以混合使用。

### 事件循环

在创建了窗口之后会执行动画函数，执行了动画函数之后就会进入mainloop，这个也是我觉的tkinter最。。。
难受的一个机制，江湖人称事件循环态。

在进入了事件循环态后，只有触发了事件才可以进行ui刷新。也就是说，这个阶段不会有类似前端中banner的动画

所以，如果想要有一个什么动画的话，只能通过两种方式，第一种是在mainloop之前通过使用label.after设置一个更新ui的timer；第二种就是通过触发事件的回调函数进行动画的编写，而且，递归无效。。。也就是说，通过回调函数写动画只能通过循环+sleep的方式。

emmm反正就是这么牛批，而且我觉得tkinter是我见过的最丑的gui界面= =。因为自己可以设置的属性相对不多，但是却很实用，而且相对来说学习起来比较快，容易上手，优点与缺点同样明显，所以也就忍了吧。

## 动画效果的实现

```python
label.after(interval, func)

mainloop()
```

一句话，使用递归，在func内部重新调用after函数，出了递归之后，窗口就会进入事件循环态，非常坑爹。

差不多就总结了这些，see u
