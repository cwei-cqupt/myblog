---
title: tkinter学习之路（二）
date: 2018-08-22 10:59:23
categories: 技术
tags: ['Python', 'gui']
---

上节书说道，使用after作为实现动画的方式，但是这种方式的弊病有很多，所以又找到了另外的一种实现方式。

在mainloop函数的解释中说道，在mainloop之后只有触发了事件才会更新ui，也就是相当于每次触发事件都会repaint整个界面。

于是我们可以通过以下方式进行动画的编写。

<!--more-->

# 动画
```python
import Tkinter as tk

def animation():
    label.configure(text=index)
if __name__ == '__main__':
    root = tk.Tk()
    label = tk.Label(root,text='test')
    # bing event 
    label.bind('<<Animation>>', animation)
    label.pack()
    root.mainloop()
    for i in range(10):
        index = i
        # use event_generate
        label.event_generate('<<Animation>>')

```

使用这个方式触发事件进行更新ui与after方式相比，性能更优，更新更精准，并且可以通过index进行精确更新。

# 自适应实现思想

## 使用gird

一种自适应思想就是使用grid进行布局，grid在我的理解里面和前端的table布局差不多。不多聊

## 使用root.bind('<Configure>', cb)

使用事件循环进行监听window的configure事件，使用回调函数进行更新。适用于使用place布局的一些app。

我自己的实现方式大概是写一个get_position的func，每次resize都去调用一次进行重绘。如果对于性能要求较高可以考虑使用节流。

目前的一些使用到的技术就是这些，在此记录
