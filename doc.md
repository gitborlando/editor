# Stage 交互逻辑

#### 选择

drag => 框选图形

click 图形 => 点击并选择图形

click stage => 取消选择

#### 拖动画布

drag => 拖动 stage

#### 缩放

wheel => 缩放画布

#### 创建

drag => 创建形状(画板, 图形, 图片, 文字)

#### 编辑

click, drag => 编辑矢量

# editor 交互

#### schema 到 item 的自动变化

id,忽略
name,忽略
lock, 无法 hover 和 select, draggable = false
visible,可直接应用
opacity,可直接应用
select, 加一个 transformer
hover, 加一个不能操作的 transformer
parent,忽略
x,可直接应用
y,可直接应用
width,可直接应用
height,可直接应用
rotation,可直接应用
points,编辑模式
fills,转换应用
strokes,转换应用
blurs,转换应用
shadows,转换应用

### 工具栏

创建矩形按钮 => stage dragStart, 生成 schema 并选择, 生成 item 并选择 => dragmove,shiftX,shiftY,操作 item 大小 =>
