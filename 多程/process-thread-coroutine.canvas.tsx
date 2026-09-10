import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  CollapsibleSection,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Swatch,
  Table,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

type TabId = "map" | "schedule" | "decide" | "bagu" | "stack";
type LayerId = "process" | "thread" | "coroutine";
type WorkKind = "cpu" | "io" | "mix";
type IsolateNeed = "yes" | "no";
type ScaleNeed = "small" | "huge";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "map", label: "嵌套关系" },
  { id: "schedule", label: "调度时间线" },
  { id: "decide", label: "怎么选" },
  { id: "bagu", label: "八股问答" },
  { id: "stack", label: "C# / Unity" },
];

const LAYER_META: Record<
  LayerId,
  { title: string; scheduler: string; color: "orange" | "blue" | "green"; oneLiner: string }
> = {
  process: {
    title: "进程",
    scheduler: "操作系统",
    color: "orange",
    oneLiner: "资源隔离单位。独立地址空间，崩溃互不影响。",
  },
  thread: {
    title: "线程",
    scheduler: "操作系统内核",
    color: "blue",
    oneLiner: "CPU 调度单位。共享进程内存，才能真并行吃多核。",
  },
  coroutine: {
    title: "协程",
    scheduler: "用户态运行时",
    color: "green",
    oneLiner: "可暂停的执行流。把「等待」从线程里抠出来。",
  },
};

export default function ProcessThreadCoroutineCanvas() {
  const [tab, setTab] = useCanvasState<TabId>("tab", "map");
  const [layer, setLayer] = useCanvasState<LayerId>("layer", "process");
  const [work, setWork] = useCanvasState<WorkKind>("work", "io");
  const [isolate, setIsolate] = useCanvasState<IsolateNeed>("isolate", "no");
  const [scale, setScale] = useCanvasState<ScaleNeed>("scale", "huge");

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>进程 / 线程 / 协程</H1>
        <Text tone="secondary">
          面试并发八股的一张图：谁调度、切换贵在哪、什么时候该用哪个。
        </Text>
      </Stack>

      <Callout tone="info" title="先记住这一句">
        进程保隔离，线程抢多核，协程堆等待。并发是交替推进，并行是同一时刻真的在不同核上跑。
      </Callout>

      <Grid columns={3} gap={16}>
        <Stat value="~80 μs" label="进程切换（量级）" tone="warning" />
        <Stat value="~3 μs" label="线程切换（量级）" />
        <Stat value="~0.15 μs" label="协程切换（量级）" tone="success" />
      </Grid>
      <Text size="small" tone="tertiary">
        数量级示意，不是基准测试。进程贵在换页表和刷 TLB，线程贵在进内核，协程只在用户态跳转。
      </Text>

      <Row gap={8} wrap>
        {TABS.map((item) => (
          <span key={item.id}>
            <Pill active={tab === item.id} onClick={() => setTab(item.id)}>
              {item.label}
            </Pill>
          </span>
        ))}
      </Row>

      {tab === "map" ? (
        <MapView layer={layer} onLayer={setLayer} />
      ) : null}
      {tab === "schedule" ? <ScheduleView layer={layer} onLayer={setLayer} /> : null}
      {tab === "decide" ? (
        <DecideView
          work={work}
          isolate={isolate}
          scale={scale}
          onWork={setWork}
          onIsolate={setIsolate}
          onScale={setScale}
        />
      ) : null}
      {tab === "bagu" ? <BaguView /> : null}
      {tab === "stack" ? <StackView /> : null}
    </Stack>
  );
}

function MapView({
  layer,
  onLayer,
}: {
  layer: LayerId;
  onLayer: (value: LayerId) => void;
}) {
  return (
    <Stack gap={20}>
      <Stack gap={8}>
        <H2>三层嵌套：一张图看完包含关系</H2>
        <Text tone="secondary">
          点下面的层，图里会高亮对应范围。进程包着线程，线程上可以挂很多协程。
        </Text>
        <Row gap={8} wrap>
          {(Object.keys(LAYER_META) as LayerId[]).map((id) => (
            <span key={id}>
              <Pill active={layer === id} onClick={() => onLayer(id)}>
                {LAYER_META[id].title}
              </Pill>
            </span>
          ))}
        </Row>
      </Stack>

      <NestDiagram active={layer} />

      <Grid columns={3} gap={12}>
        {(Object.keys(LAYER_META) as LayerId[]).map((id) => (
          <div key={id}>
            <Card>
              <CardHeader trailing={<Pill size="sm" active={layer === id}>{LAYER_META[id].scheduler}</Pill>}>
                {LAYER_META[id].title}
              </CardHeader>
              <CardBody>
                <Stack gap={8}>
                  <Text>{LAYER_META[id].oneLiner}</Text>
                  <Text size="small" tone="secondary">
                    {id === "process"
                      ? "创建要分配页表；通信走 IPC；一个进程写爆内存，打不死另一个。"
                      : id === "thread"
                        ? "共享堆和全局变量，所以最快也最容易写错。默认栈往往是 MB 级。"
                        : "默认不吃满多核。await / yield 才让出；堵住事件循环，所有协程一起饿死。"}
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          </div>
        ))}
      </Grid>

      <Stack gap={8}>
        <H2>切换成本：线性坐标下的数量级差</H2>
        <Text tone="secondary">
          纵轴是典型切换耗时（微秒）。协程几乎贴地，这正是「一万连接不要一人一线程」的原因。
        </Text>
        <BarChart
          categories={["协程", "线程", "进程"]}
          series={[{ name: "典型切换耗时", data: [0.15, 3, 80], tone: "info" }]}
          valueSuffix=" μs"
          height={220}
          showValues
        />
        <Text size="small" tone="tertiary">
          Source: 操作系统 / 运行时常见数量级 · 示意值（协程 150ns、线程 3μs、进程 80μs）
        </Text>
      </Stack>

      <Stack gap={8}>
        <H2>一万个「正在等待」的任务，内存差在哪</H2>
        <Text tone="secondary">
          等的是网络或磁盘，不是在算。线程按 1MB 栈估，协程按状态机几百字节估。
        </Text>
        <BarChart
          categories={["协程状态机", "线程栈", "进程工作集"]}
          series={[{ name: "1 万个等待任务占用", data: [8, 10000, 40000], tone: "warning" }]}
          valueSuffix=" MB"
          height={200}
          horizontal
          showValues
        />
        <Text size="small" tone="tertiary">
          Source: 数量级估算 · 协程 ~0.8KB × 10k；线程 1MB × 10k；进程数十 MB 工作集 × 10k
        </Text>
      </Stack>

      <Stack gap={8}>
        <H2>对照表</H2>
        <Table
          headers={["维度", "进程", "线程", "协程"]}
          rows={[
            ["本质", "OS 资源单位", "OS 执行单位", "用户态可暂停执行流"],
            ["谁调度", "操作系统", "内核调度器", "运行时 / 框架"],
            ["切换", "最贵（页表、TLB）", "中等（进内核）", "最便宜（状态机）"],
            ["隔离", "地址空间独立", "共享进程内存", "通常共享同一线程"],
            ["并行", "能，跨核", "能，跨核", "默认不能，要线程托底"],
            ["适合", "隔离、绕 GIL、防崩溃", "CPU 并行、外包阻塞", "海量等待"],
          ]}
          striped
          rowTone={["info", "neutral", "warning", "success", "info", "neutral"]}
        />
      </Stack>
    </Stack>
  );
}

function NestDiagram({ active }: { active: LayerId }) {
  const theme = useHostTheme();
  const dim = theme.fill.quaternary;
  const stroke = theme.stroke.secondary;
  const text = theme.text.primary;
  const muted = theme.text.tertiary;
  const processFill = active === "process" ? theme.fill.secondary : dim;
  const threadFill = active === "thread" ? theme.fill.secondary : theme.bg.elevated;
  const coroFill = active === "coroutine" ? theme.accent.primary : theme.fill.tertiary;
  const coroText = active === "coroutine" ? theme.text.onAccent : theme.text.secondary;
  const processStroke = active === "process" ? theme.accent.primary : stroke;
  const threadStroke = active === "thread" ? theme.accent.primary : stroke;

  return (
    <svg viewBox="0 0 720 280" width="100%" height="280" role="img" aria-label="Process contains threads contains coroutines">
      <rect x="8" y="8" width="704" height="168" rx="8" fill={processFill} stroke={processStroke} strokeWidth={active === "process" ? 2 : 1} />
      <text x="24" y="32" fill={text} fontSize="13" fontWeight="600">
        Process A · 独立地址空间
      </text>
      <text x="24" y="50" fill={muted} fontSize="11">
        页表 / 文件描述符 / 堆 · 崩溃打不死 Process B
      </text>

      <rect x="24" y="64" width="328" height="96" rx="6" fill={threadFill} stroke={threadStroke} strokeWidth={active === "thread" ? 2 : 1} />
      <text x="36" y="84" fill={text} fontSize="12" fontWeight="600">
        Thread 1 · 自有栈
      </text>
      <rect x="36" y="96" width="72" height="48" rx="4" fill={coroFill} />
      <text x="48" y="124" fill={coroText} fontSize="11">
        C1
      </text>
      <rect x="116" y="96" width="72" height="48" rx="4" fill={coroFill} />
      <text x="128" y="124" fill={coroText} fontSize="11">
        C2
      </text>
      <rect x="196" y="96" width="72" height="48" rx="4" fill={coroFill} />
      <text x="208" y="124" fill={coroText} fontSize="11">
        C3 await
      </text>
      <text x="280" y="124" fill={muted} fontSize="11">
        …
      </text>

      <rect x="368" y="64" width="328" height="96" rx="6" fill={threadFill} stroke={threadStroke} strokeWidth={active === "thread" ? 2 : 1} />
      <text x="380" y="84" fill={text} fontSize="12" fontWeight="600">
        Thread 2 · 可跑在另一颗核
      </text>
      <rect x="380" y="96" width="72" height="48" rx="4" fill={coroFill} />
      <text x="392" y="124" fill={coroText} fontSize="11">
        C4
      </text>
      <rect x="460" y="96" width="72" height="48" rx="4" fill={coroFill} />
      <text x="472" y="124" fill={coroText} fontSize="11">
        C5
      </text>
      <text x="552" y="124" fill={muted} fontSize="11">
        线程池 / 阻塞调用
      </text>

      <rect x="8" y="192" width="704" height="72" rx="8" fill={active === "process" ? theme.fill.secondary : dim} stroke={processStroke} strokeWidth={active === "process" ? 2 : 1} />
      <text x="24" y="222" fill={text} fontSize="13" fontWeight="600">
        Process B · 另一份虚拟内存
      </text>
      <text x="24" y="242" fill={muted} fontSize="11">
        IPC 才能通信（管道 / 共享内存 / socket）。Python 靠它绕开 GIL。
      </text>
    </svg>
  );
}

function ScheduleView({
  layer,
  onLayer,
}: {
  layer: LayerId;
  onLayer: (value: LayerId) => void;
}) {
  return (
    <Stack gap={20}>
      <Stack gap={8}>
        <H2>同一段墙上时间，三种调度长什么样</H2>
        <Text tone="secondary">
          横轴是时间。进程切换留下明显空档；线程在核上被抢占切片；协程在一条线程上自己让出。
        </Text>
        <Row gap={8} wrap>
          {(Object.keys(LAYER_META) as LayerId[]).map((id) => (
            <span key={id}>
              <Pill active={layer === id} onClick={() => onLayer(id)}>
                {LAYER_META[id].title}
              </Pill>
            </span>
          ))}
        </Row>
      </Stack>

      <ScheduleGantt model={layer} />

      {layer === "process" ? (
        <Callout tone="warning" title="进程：空档就是页表和 TLB">
          每个色块是一个进程独占 CPU。色块之间的空隙是上下文切换：换页表、刷 TLB、缓存变冷。隔离最好，切换最贵。
        </Callout>
      ) : null}
      {layer === "thread" ? (
        <Callout tone="info" title="线程：两核上的抢占式切片">
          同一进程里的 T1 / T2 / T3 共享堆。内核按时间片抢占，所以能并行，也会在任意指令边界被切走。共享内存通信快，竞态也来自这里。
        </Callout>
      ) : null}
      {layer === "coroutine" ? (
        <Callout tone="success" title="协程：一条线程上的协作式交接">
          竖线是 await / yield。没让出之前，别的协程插不进来。切换只是恢复状态机，所以能挂几万个「正在等 IO」的任务。默认不是并行。
        </Callout>
      ) : null}

      <Stack gap={8}>
        <H3>一颗核上的时间都花去哪了</H3>
        {layer === "process" ? (
          <Stack gap={8}>
            <UsageLegend
              segments={[
                { id: "work", label: "有效计算", color: "blue", value: 62 },
                { id: "switch", label: "进程切换 + 缓存冷启动", color: "orange", value: 28 },
                { id: "idle", label: "等待调度", color: "gray", value: 10 },
              ]}
            />
          </Stack>
        ) : null}
        {layer === "thread" ? (
          <UsageLegend
            segments={[
              { id: "work", label: "有效计算", color: "blue", value: 78 },
              { id: "switch", label: "内核调度 / 锁等待", color: "orange", value: 16 },
              { id: "idle", label: "时间片间隙", color: "gray", value: 6 },
            ]}
          />
        ) : null}
        {layer === "coroutine" ? (
          <UsageLegend
            segments={[
              { id: "work", label: "有效计算 + 状态机恢复", color: "green", value: 18 },
              { id: "wait", label: "等 IO（线程可以去干别的）", color: "cyan", value: 74 },
              { id: "switch", label: "协程切换", color: "gray", value: 8 },
            ]}
          />
        ) : null}
      </Stack>

      <Divider />

      <Stack gap={8}>
        <H3>最容易考混的一对词</H3>
        <Grid columns={2} gap={12}>
          <Card>
            <CardHeader trailing={<Pill size="sm">concurrency</Pill>}>并发</CardHeader>
            <CardBody>
              <Text>
                同一时段里有多个任务在推进，可以交替。一条线程上的一万个协程就是并发。
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Pill size="sm">parallelism</Pill>}>并行</CardHeader>
            <CardBody>
              <Text>
                同一时刻真的有多个任务在不同核上跑。要线程或进程，协程单独做不到。
              </Text>
            </CardBody>
          </Card>
        </Grid>
      </Stack>
    </Stack>
  );
}

function ScheduleGantt({ model }: { model: LayerId }) {
  const theme = useHostTheme();
  const track = theme.fill.quaternary;
  const label = theme.text.secondary;
  const axis = theme.text.tertiary;
  const gap = theme.bg.editor;

  const processBlocks = [
    { lane: 0, x: 90, w: 150, fill: theme.category.orange, name: "P1" },
    { lane: 1, x: 270, w: 150, fill: theme.category.blue, name: "P2" },
    { lane: 2, x: 450, w: 150, fill: theme.category.green, name: "P3" },
  ];

  const threadBlocks = [
    { lane: 0, x: 90, w: 70, fill: theme.category.blue, name: "T1" },
    { lane: 0, x: 168, w: 70, fill: theme.category.purple, name: "T2" },
    { lane: 0, x: 246, w: 70, fill: theme.category.blue, name: "T1" },
    { lane: 0, x: 324, w: 70, fill: theme.category.cyan, name: "T3" },
    { lane: 0, x: 402, w: 70, fill: theme.category.blue, name: "T1" },
    { lane: 0, x: 480, w: 70, fill: theme.category.purple, name: "T2" },
    { lane: 1, x: 90, w: 70, fill: theme.category.cyan, name: "T3" },
    { lane: 1, x: 168, w: 70, fill: theme.category.cyan, name: "T3" },
    { lane: 1, x: 246, w: 70, fill: theme.category.purple, name: "T2" },
    { lane: 1, x: 324, w: 70, fill: theme.category.blue, name: "T1" },
    { lane: 1, x: 402, w: 70, fill: theme.category.cyan, name: "T3" },
    { lane: 1, x: 480, w: 70, fill: theme.category.cyan, name: "T3" },
  ];

  const coroBlocks = [
    { lane: 0, x: 90, w: 40, fill: theme.category.green, name: "C1" },
    { lane: 0, x: 138, w: 40, fill: theme.category.blue, name: "C2" },
    { lane: 0, x: 186, w: 40, fill: theme.category.purple, name: "C3" },
    { lane: 0, x: 234, w: 40, fill: theme.category.green, name: "C1" },
    { lane: 0, x: 282, w: 40, fill: theme.category.orange, name: "C4" },
    { lane: 0, x: 330, w: 40, fill: theme.category.blue, name: "C2" },
    { lane: 0, x: 378, w: 40, fill: theme.category.cyan, name: "C5" },
    { lane: 0, x: 426, w: 40, fill: theme.category.green, name: "C1" },
    { lane: 0, x: 474, w: 40, fill: theme.category.purple, name: "C3" },
    { lane: 0, x: 522, w: 40, fill: theme.category.orange, name: "C4" },
  ];

  const lanes =
    model === "process"
      ? ["CPU", "（切走）", "（再切）"]
      : model === "thread"
        ? ["Core 0", "Core 1"]
        : ["Thread"];

  const blocks = model === "process" ? processBlocks : model === "thread" ? threadBlocks : coroBlocks;
  const laneH = 44;
  const height = 56 + lanes.length * laneH;

  return (
    <svg viewBox={`0 0 640 ${height}`} width="100%" height={height} role="img" aria-label="Scheduling timeline">
      {lanes.map((name, i) => (
        <g key={name}>
          <rect x="80" y={24 + i * laneH} width="500" height={32} rx="4" fill={track} />
          <text x="8" y={46 + i * laneH} fill={label} fontSize="11">
            {name}
          </text>
        </g>
      ))}
      {model === "process"
        ? processBlocks.map((b) => (
            <rect
              key={`${b.name}-${b.x}`}
              x={b.x + b.w}
              y={24 + b.lane * laneH}
              width={24}
              height={32}
              fill={gap}
            />
          ))
        : null}
      {blocks.map((b, idx) => (
        <g key={`${b.name}-${b.x}-${idx}`}>
          <rect x={b.x} y={24 + b.lane * laneH} width={b.w} height={32} rx="3" fill={b.fill} />
          <text x={b.x + 8} y={45 + b.lane * laneH} fill={theme.bg.editor} fontSize="11" fontWeight="600">
            {b.name}
          </text>
        </g>
      ))}
      {model === "coroutine"
        ? [130, 178, 226, 274, 322, 370, 418, 466, 514].map((x) => (
            <line key={x} x1={x} y1={20} x2={x} y2={60} stroke={theme.text.primary} strokeWidth={1} />
          ))
        : null}
      <text x="90" y={height - 6} fill={axis} fontSize="10">
        t0
      </text>
      <text x="560" y={height - 6} fill={axis} fontSize="10">
        时间
      </text>
      {model === "coroutine" ? (
        <text x="90" y={16} fill={axis} fontSize="10">
          竖线 = await / yield 让出点
        </text>
      ) : null}
      {model === "process" ? (
        <text x="90" y={16} fill={axis} fontSize="10">
          色块之间的空隙 = 进程切换
        </text>
      ) : null}
      {model === "thread" ? (
        <text x="90" y={16} fill={axis} fontSize="10">
          同色 = 同一线程被内核切到不同时间片
        </text>
      ) : null}
    </svg>
  );
}

function UsageLegend({
  segments,
}: {
  segments: Array<{ id: string; label: string; color: "blue" | "orange" | "gray" | "green" | "cyan"; value: number }>;
}) {
  const theme = useHostTheme();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  return (
    <Stack gap={8}>
      <div
        style={{
          display: "flex",
          height: 10,
          borderRadius: 4,
          overflow: "hidden",
          background: theme.fill.quaternary,
        }}
      >
        {segments.map((s) => (
          <div
            key={s.id}
            style={{
              width: `${(s.value / total) * 100}%`,
              background: theme.category[s.color],
            }}
          />
        ))}
      </div>
      <Stack gap={4}>
        {segments.map((s) => (
          <div key={s.id}>
            <Row gap={8} align="center">
              <Swatch color={s.color} />
              <Text size="small">
                {s.label}
                {"  "}
                {s.value}%
              </Text>
            </Row>
          </div>
        ))}
      </Stack>
    </Stack>
  );
}

function DecideView({
  work,
  isolate,
  scale,
  onWork,
  onIsolate,
  onScale,
}: {
  work: WorkKind;
  isolate: IsolateNeed;
  scale: ScaleNeed;
  onWork: (value: WorkKind) => void;
  onIsolate: (value: IsolateNeed) => void;
  onScale: (value: ScaleNeed) => void;
}) {
  const pick = recommend(work, isolate, scale);

  return (
    <Stack gap={20}>
      <Stack gap={8}>
        <H2>三个问题定方案</H2>
        <Text tone="secondary">改下面的条件，看推荐怎么变。生产里常常是三层叠在一起，而不是三选一。</Text>
      </Stack>

      <Grid columns={3} gap={16}>
        <Stack gap={8}>
          <H3>1. 主要在算还是在等</H3>
          <Row gap={8} wrap>
            <Pill active={work === "cpu"} onClick={() => onWork("cpu")}>
              CPU 密集
            </Pill>
            <Pill active={work === "io"} onClick={() => onWork("io")}>
              IO 等待
            </Pill>
            <Pill active={work === "mix"} onClick={() => onWork("mix")}>
              又算又等
            </Pill>
          </Row>
        </Stack>
        <Stack gap={8}>
          <H3>2. 要不要崩溃隔离</H3>
          <Row gap={8} wrap>
            <Pill active={isolate === "yes"} onClick={() => onIsolate("yes")}>
              要隔离
            </Pill>
            <Pill active={isolate === "no"} onClick={() => onIsolate("no")}>
              同生共死即可
            </Pill>
          </Row>
        </Stack>
        <Stack gap={8}>
          <H3>3. 同时活着的任务量</H3>
          <Row gap={8} wrap>
            <Pill active={scale === "small"} onClick={() => onScale("small")}>
              几百个
            </Pill>
            <Pill active={scale === "huge"} onClick={() => onScale("huge")}>
              几万连接
            </Pill>
          </Row>
        </Stack>
      </Grid>

      <Callout tone={pick.tone} title={pick.title}>
        {pick.body}
      </Callout>

      <Stack gap={8}>
        <H2>生产里更常见的叠法</H2>
        <Text tone="secondary">Go 把后两层收成 M:N（goroutine 映射到少量 OS 线程）。C# 是 async 状态机 + ThreadPool。</Text>
        <Pipeline />
      </Stack>

      <Table
        headers={["问自己", "选这个", "别踩这个坑"]}
        rows={[
          ["任务是算还是等？", "算 → 进程 / 线程；等 → 协程", "用协程去啃纯 CPU，单核打转"],
          ["要不要隔离？", "要 → 多进程", "把互不信任的插件塞进同一进程"],
          ["共享状态多不多？", "先改成消息 / 不可变，再谈锁", "到处加锁却说「线程安全」"],
          ["有没有阻塞调用？", "丢线程池，别堵事件循环", "在 await 链里写 Thread.Sleep / 同步读盘"],
          ["规模到哪？", "几百用线程；几万连接必须异步", "一人一线程扛 C10k"],
        ]}
        striped
      />
    </Stack>
  );
}

function recommend(
  work: WorkKind,
  isolate: IsolateNeed,
  scale: ScaleNeed,
): { tone: "info" | "success" | "warning"; title: string; body: string } {
  if (isolate === "yes") {
    return {
      tone: "warning",
      title: "先上多进程，再在进程里分层",
      body:
        work === "io" && scale === "huge"
          ? "每个进程里跑事件循环 + 协程扛连接；进程边界用来沙箱和防崩溃。浏览器标签页、插件宿主都是这个思路。"
          : "进程负责隔离和吃多核（也绕开 GIL）。进程内部仍可用线程池处理 CPU 碎片，不要为每个请求 fork 一次。",
    };
  }
  if (work === "cpu") {
    return {
      tone: "info",
      title: "要真并行：线程或进程，不要只开协程",
      body:
        scale === "huge"
          ? "任务很多也先切块丢线程池 / 多进程，协程不会自动用满多核。Python CPU 密集优先 multiprocessing。"
          : "线程池就够。注意主线程限制（Unity API）和 GIL（CPython）。",
    };
  }
  if (work === "io" && scale === "huge") {
    return {
      tone: "success",
      title: "协程 / 异步 IO，少量线程托底",
      body: "一万个连接各开一个线程会先死在栈内存和调度上。一条事件循环挂几万个 await 是常态。阻塞库必须丢到线程池。",
    };
  }
  if (work === "mix") {
    return {
      tone: "info",
      title: "拆开：等的走协程，算的走线程池",
      body: "同一条请求里先 await 网络，再把编码 / 物理 / 推理丢到后台线程，完成后续回事件循环。别在协程里同步算大活。",
    };
  }
  return {
    tone: "info",
    title: "规模不大：线程就够，不必上协程",
    body: "几百个任务用线程池更直观。协程的收益出现在「等待远多于计算、任务数上万」的时候。",
  };
}

function Pipeline() {
  const theme = useHostTheme();
  const boxes = [
    { title: "多进程", sub: "隔离 · 吃多核" },
    { title: "每进程线程池", sub: "阻塞 · CPU 碎片" },
    { title: "事件循环 + 协程", sub: "海量等待" },
  ];
  return (
    <Row gap={8} align="center" wrap>
      {boxes.map((box, i) => (
        <div key={box.title}>
          <Row gap={8} align="center">
            <div
              style={{
                padding: "10px 14px",
                background: theme.fill.tertiary,
                border: `1px solid ${theme.stroke.tertiary}`,
                borderRadius: 6,
                minWidth: 140,
              }}
            >
              <Text weight="semibold">{box.title}</Text>
              <Text size="small" tone="secondary">
                {box.sub}
              </Text>
            </div>
            {i < boxes.length - 1 ? (
              <Text tone="tertiary" as="span">
                →
              </Text>
            ) : null}
          </Row>
        </div>
      ))}
    </Row>
  );
}

function BaguView() {
  return (
    <Stack gap={16}>
      <H2>面试里会追问的几句</H2>
      <Text tone="secondary">先答结论，再补一句代价。展开看完整口径。</Text>

      <CollapsibleSection title="协程能替代线程吗？" defaultOpen trailing={<Text size="small" tone="tertiary">不能单独替代</Text>}>
        <Text>
          协程解决的是「别为了等 IO 浪费一个 OS 线程」。CPU 密集、调用阻塞库、需要抢占式公平调度时，还是要线程或进程。
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="有了协程为什么还要锁？" trailing={<Text size="small" tone="tertiary">await 不是临界区结束</Text>}>
        <Text>
          单线程事件循环里，两次 await 之间如果没有让出，相对其他协程可以看成原子。但多线程跑多个 loop、协程和后台线程碰同一对象、await 之后状态被别人改了，仍然要同步。
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="Python：GIL、多线程、asyncio、multiprocessing" trailing={<Text size="small" tone="tertiary">四件套</Text>}>
        <Stack gap={8}>
          <Text>GIL：同一时刻只有一个线程在执行 Python 字节码。</Text>
          <Text>CPU 密集：multiprocessing，或 C 扩展里放掉 GIL。</Text>
          <Text>IO 密集：多线程也能用（IO 时会放 GIL）；asyncio 更省线程。</Text>
          <Text>asyncio 默认 loop 不线程安全，和线程混用要调用线程安全的接口。</Text>
        </Stack>
      </CollapsibleSection>

      <CollapsibleSection title="为什么协程里不能写 Thread.Sleep / 同步读文件？" trailing={<Text size="small" tone="tertiary">最高频坑</Text>}>
        <Text>
          那会堵住整条事件循环线程。后面所有协程一起饿死，看起来像「异步系统挂了」。阻塞调用必须丢到线程池，或换成真正的异步 API。
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="死锁四条件，协程也会中招吗？" trailing={<Text size="small" tone="tertiary">会</Text>}>
        <Text>
          互斥、持有并等待、不可抢占、环形等待。A await B 的结果、B 又 await A，一样死锁，只是堆栈看起来不像线程死锁那么直观。
        </Text>
      </CollapsibleSection>

      <CollapsibleSection title="有栈协程和无栈协程差在哪？" trailing={<Text size="small" tone="tertiary">挂起点</Text>}>
        <Stack gap={8}>
          <Text>
            有栈（stackful）：自带独立栈，任意嵌套调用都能挂起。Go goroutine、Lua 协程偏这类。
          </Text>
          <Text>
            无栈（stackless）：挂起点必须是编译器看得见的 async / await，生成状态机。C# Task、Python asyncio、JS Promise、Unity IEnumerator 都是。
          </Text>
        </Stack>
      </CollapsibleSection>

      <Divider />

      <H3>收尾口诀（面试最后 10 秒）</H3>
      <Table
        headers={["顺序", "问题", "答案方向"]}
        rows={[
          ["1", "算还是等？", "算 → 并行（进程 / 线程）；等 → 异步 / 协程"],
          ["2", "要不要隔离？", "要 → 进程"],
          ["3", "共享状态乱不乱？", "先消息化，再谈锁"],
          ["4", "有没有阻塞调用？", "有 → 线程池，别堵 loop"],
          ["5", "规模到哪？", "几百线程；几万必须异步"],
        ]}
        striped
        columnAlign={["center", "left", "left"]}
      />
    </Stack>
  );
}

function StackView() {
  return (
    <Stack gap={20}>
      <Stack gap={8}>
        <H2>落到 C# / Unity（以及旁边的 Python）</H2>
        <Text tone="secondary">
          同一套概念，三个运行时的名字不一样。Unity 的 Coroutine 跑在主线程，不是 OS 线程。
        </Text>
      </Stack>

      <Table
        headers={["概念", "C# / .NET", "Unity", "Python"]}
        rows={[
          ["无栈协程", "async / await + Task", "IEnumerator Coroutine；也可 async", "asyncio + coroutine"],
          ["线程池", "ThreadPool / Task.Run", "几乎不能碰引擎 API", "concurrent.futures"],
          ["真多核 CPU", "多线程；注意同步", "Job System / 自管线程", "multiprocessing（GIL）"],
          ["多进程", "少见；工具链 / 服务", "客户端很少用", "ProcessPoolExecutor"],
          ["让出点", "await", "yield return", "await / yield"],
        ]}
        striped
      />

      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>Unity StartCoroutine</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                主线程每帧 <Code>MoveNext()</Code>。适合等一帧、等动画、等几秒。不是并行，不会用满多核。
              </Text>
              <Text size="small" tone="secondary">
                引擎对象必须在主线程碰。这和「协程很轻」不矛盾：轻的是调度，限制的是线程亲和。
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>C# async / await</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                IO 完成后由同步上下文决定续跑在哪：UI / Unity 主线程，或线程池。默认可以切走。
              </Text>
              <Text size="small" tone="secondary">
                <Code>ConfigureAwait(false)</Code> 用来避免抢回原上下文。游戏主线程上要小心。
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Callout tone="warning" title="和本项目相关的一条">
        这个工程是 Input System Only，且 Update 里不能稳态抛异常。协程 / 异步回调同样算「每帧或高频路径」：先校验再调用，不要靠 try/catch 当控制流。
      </Callout>
    </Stack>
  );
}
