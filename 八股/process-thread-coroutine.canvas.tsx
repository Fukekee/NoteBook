import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

type TabId = "map" | "frame" | "pick" | "project";
type LayerId = "process" | "thread" | "coroutine";
type WaitKind = "frame" | "http" | "cpu" | "room";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "map", label: "三层" },
  { id: "frame", label: "一帧里" },
  { id: "pick", label: "怎么选" },
  { id: "project", label: "本项目" },
];

export default function UnityProcessThreadCoroutine() {
  const [tab, setTab] = useCanvasState<TabId>("tab", "map");
  const [layer, setLayer] = useCanvasState<LayerId>("layer", "coroutine");
  const [wait, setWait] = useCanvasState<WaitKind>("wait", "frame");

  return (
    <Stack gap={24}>
      <Stack gap={8}>
        <H1>Unity 里的进程 / 线程 / 协程</H1>
        <Text tone="secondary">
          只讲播放器和本项目。协程跑在主线程的 PlayerLoop 里，不是另开一条线程去等。
        </Text>
      </Stack>

      <Callout tone="info" title="Unity 里先记住这一句">
        一个 Player 通常就是一个进程。进程里几乎只有主线程能碰引擎对象。协程是主线程上可暂停的一段脚本，把「等下一帧 / 等一秒 / 等请求」让出来，好让同一帧的 Update 和渲染继续跑。
      </Callout>

      <Grid columns={3} gap={16}>
        <Stat value="1" label="典型：一个 Player 一个进程" />
        <Stat value="主线程" label="PlayerLoop / 协程 / 绝大多数脚本" tone="warning" />
        <Stat value="16.6 ms" label="60fps 时一帧预算" tone="success" />
      </Grid>

      <Row gap={8} wrap>
        {TABS.map((item) => (
          <span key={item.id}>
            <Pill active={tab === item.id} onClick={() => setTab(item.id)}>
              {item.label}
            </Pill>
          </span>
        ))}
      </Row>

      {tab === "map" ? <MapView layer={layer} onLayer={setLayer} /> : null}
      {tab === "frame" ? <FrameView /> : null}
      {tab === "pick" ? <PickView wait={wait} onWait={setWait} /> : null}
      {tab === "project" ? <ProjectView /> : null}
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
        <H2>一个 Unity 进程里套着什么</H2>
        <Text tone="secondary">
          点下面一层，图里高亮对应范围。协程画在主线程里面，因为它们从不离开这条线程。
        </Text>
        <Row gap={8} wrap>
          <span>
            <Pill active={layer === "process"} onClick={() => onLayer("process")}>
              进程
            </Pill>
          </span>
          <span>
            <Pill active={layer === "thread"} onClick={() => onLayer("thread")}>
              线程
            </Pill>
          </span>
          <span>
            <Pill active={layer === "coroutine"} onClick={() => onLayer("coroutine")}>
              协程
            </Pill>
          </span>
        </Row>
      </Stack>

      <UnityNestDiagram active={layer} />

      <Grid columns={3} gap={12}>
        <div>
          <Card>
            <CardHeader trailing={<Pill size="sm">OS 进程</Pill>}>进程</CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text>
                  一次运行的 Editor、一次 Build 出来的 Player、或一台 headless 服务器，各自是一个进程。
                </Text>
                <Text size="small" tone="secondary">
                  地址空间独立。手机客户端几乎不会自己再开进程。联机独立服若一房间一进程，房间崩了不影响别的房间。
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader trailing={<Pill size="sm">OS 线程</Pill>}>线程</CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text>
                  主线程跑 PlayerLoop。工作线程只能算数或等阻塞 IO，算完必须把结果带回来再改 Transform / UI。
                </Text>
                <Text size="small" tone="secondary">
                  在工作线程里碰 GameObject 会抛异常或静默坏掉。本项目 Scripts 里基本没有 Job System，后台活主要靠插件或 async。
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader trailing={<Pill size="sm">主线程脚本</Pill>}>协程</CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text>
                  <Code>StartCoroutine</Code> + <Code>IEnumerator</Code>。碰到 <Code>yield return</Code> 就暂停，下一帧或条件满足再继续。
                </Text>
                <Text size="small" tone="secondary">
                  不占第二条线程。卡住主线程（同步读盘、死循环），所有协程和画面一起停。
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </div>
      </Grid>

      <Stack gap={8}>
        <H2>对照（只比 Unity）</H2>
        <Table
          headers={["", "进程", "主线程 / 工作线程", "协程"]}
          rows={[
            ["是什么", "一个 Player / Editor / 服务器", "OS 调度的执行者", "主线程上可暂停的一段脚本"],
            ["谁推进", "操作系统拉起进程", "内核调度；主线程每帧跑 PlayerLoop", "PlayerLoop 脚本阶段 MoveNext"],
            ["能碰引擎 API", "整个进程都能，但要在对的线程", "只有主线程可以", "可以，因为它就在主线程"],
            ["并行吃多核", "多个进程可以", "工作线程 / Job 可以", "不能，只是交替执行"],
            ["适合干什么", "隔离房间、独立服、Editor 与真机分开", "重计算、堵住的同步调用", "等一帧、等动画、等 GPS、等 UnityWebRequest"],
          ]}
          striped
        />
      </Stack>
    </Stack>
  );
}

function UnityNestDiagram({ active }: { active: LayerId }) {
  const theme = useHostTheme();
  const dim = theme.fill.quaternary;
  const stroke = theme.stroke.secondary;
  const text = theme.text.primary;
  const muted = theme.text.tertiary;
  const processFill = active === "process" ? theme.fill.secondary : dim;
  const processStroke = active === "process" ? theme.accent.primary : stroke;
  const threadFill = active === "thread" ? theme.fill.secondary : theme.bg.elevated;
  const threadStroke = active === "thread" ? theme.accent.primary : stroke;
  const coroFill = active === "coroutine" ? theme.accent.primary : theme.fill.tertiary;
  const coroText = active === "coroutine" ? theme.text.onAccent : theme.text.secondary;

  return (
    <svg
      viewBox="0 0 720 300"
      width="100%"
      height="300"
      role="img"
      aria-label="Unity process contains main thread contains coroutines"
    >
      <rect
        x="8"
        y="8"
        width="704"
        height="200"
        rx="8"
        fill={processFill}
        stroke={processStroke}
        strokeWidth={active === "process" ? 2 : 1}
      />
      <text x="24" y="32" fill={text} fontSize="13" fontWeight="600">
        Unity Player 进程
      </text>
      <text x="24" y="50" fill={muted} fontSize="11">
        一份托管堆、一份场景、一套 Time / Physics。进程没了，这一局全没。
      </text>

      <rect
        x="24"
        y="64"
        width="456"
        height="128"
        rx="6"
        fill={threadFill}
        stroke={threadStroke}
        strokeWidth={active === "thread" ? 2 : 1}
      />
      <text x="36" y="84" fill={text} fontSize="12" fontWeight="600">
        Main Thread · PlayerLoop 跑在这里
      </text>
      <text x="36" y="100" fill={muted} fontSize="11">
        Update / 物理 / 渲染 / NGO 回调
      </text>
      <rect x="36" y="112" width="88" height="60" rx="4" fill={coroFill} />
      <text x="48" y="138" fill={coroText} fontSize="11">
        协程 C1
      </text>
      <text x="48" y="154" fill={coroText} fontSize="10">
        yield 下一帧
      </text>
      <rect x="132" y="112" width="88" height="60" rx="4" fill={coroFill} />
      <text x="144" y="138" fill={coroText} fontSize="11">
        协程 C2
      </text>
      <text x="144" y="154" fill={coroText} fontSize="10">
        等 GPS
      </text>
      <rect x="228" y="112" width="88" height="60" rx="4" fill={coroFill} />
      <text x="240" y="138" fill={coroText} fontSize="11">
        协程 C3
      </text>
      <text x="240" y="154" fill={coroText} fontSize="10">
        等 1 秒
      </text>
      <text x="332" y="146" fill={muted} fontSize="11">
        都在主线程交替推进
      </text>

      <rect
        x="496"
        y="64"
        width="196"
        height="128"
        rx="6"
        fill={threadFill}
        stroke={threadStroke}
        strokeWidth={active === "thread" ? 2 : 1}
      />
      <text x="508" y="84" fill={text} fontSize="12" fontWeight="600">
        Worker Thread
      </text>
      <text x="508" y="108" fill={muted} fontSize="11">
        Task.Run / 原生插件
      </text>
      <text x="508" y="126" fill={muted} fontSize="11">
        不能碰 Transform
      </text>
      <text x="508" y="144" fill={muted} fontSize="11">
        结果要带回主线程
      </text>

      <rect
        x="8"
        y="224"
        width="704"
        height="64"
        rx="8"
        fill={active === "process" ? theme.fill.secondary : dim}
        stroke={processStroke}
        strokeWidth={active === "process" ? 2 : 1}
      />
      <text x="24" y="250" fill={text} fontSize="13" fontWeight="600">
        另一个进程（Editor 或独立 headless 房间）
      </text>
      <text x="24" y="270" fill={muted} fontSize="11">
        和上面的 Player 互不影响。本项目若一房间一服，隔离的是这一层，不是协程。
      </text>
    </svg>
  );
}

function FrameView() {
  const theme = useHostTheme();
  const steps = [
    { id: "early", label: "EarlyUpdate", note: "输入、时间", w: 70 },
    { id: "fixed", label: "FixedUpdate", note: "物理", w: 80 },
    { id: "update", label: "Update + 协程", note: "你的脚本 MoveNext", w: 150 },
    { id: "late", label: "LateUpdate", note: "相机、收尾", w: 90 },
    { id: "render", label: "Render", note: "画这一帧", w: 120 },
    { id: "net", label: "网络回调", note: "NGO RPC 常在这趟车上", w: 110 },
  ];

  return (
    <Stack gap={20}>
      <Stack gap={8}>
        <H2>主线程每一帧在跑 PlayerLoop</H2>
        <Text tone="secondary">
          PlayerLoop 不是另一条线程，是主线程的行程单。协程的「继续往下走」就插在脚本那一步。
        </Text>
      </Stack>

      <svg viewBox="0 0 720 120" width="100%" height="120" role="img" aria-label="One Unity frame">
        <text x="8" y="20" fill={theme.text.secondary} fontSize="12">
          一帧 · 预算约 16.6ms（60fps）
        </text>
        {steps.reduce<{ nodes: Array<typeof steps[0] & { x: number }>; x: number }>(
          (acc, step) => {
            acc.nodes.push({ ...step, x: acc.x });
            acc.x += step.w + 8;
            return acc;
          },
          { nodes: [], x: 8 },
        ).nodes.map((step) => (
          <g key={step.id}>
            <rect
              x={step.x}
              y={36}
              width={step.w}
              height={56}
              rx="4"
              fill={step.id === "update" ? theme.accent.primary : theme.fill.tertiary}
            />
            <text
              x={step.x + 8}
              y={58}
              fill={step.id === "update" ? theme.text.onAccent : theme.text.primary}
              fontSize="11"
              fontWeight="600"
            >
              {step.label}
            </text>
            <text
              x={step.x + 8}
              y={76}
              fill={step.id === "update" ? theme.text.onAccent : theme.text.tertiary}
              fontSize="10"
            >
              {step.note}
            </text>
          </g>
        ))}
      </svg>
      <Text size="small" tone="tertiary">
        示意顺序，不是官方子系统全表。高亮的是协程被推进的位置。
      </Text>

      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>yield 时主线程在干什么</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                <Code>yield return null</Code>：这条协程本帧结束，主线程继续 LateUpdate、渲染、下一帧再回来。
              </Text>
              <Text>
                <Code>yield return new WaitForSeconds(1)</Code>：中间几十帧的 PlayerLoop 照常跑，别人的 Update 和画面都不停。
              </Text>
              <Text size="small" tone="secondary">
                没有另开线程站着等。只是行程单上暂时不点你的名字。
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>什么会把整帧卡死</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                协程或 Update 里写同步死循环、同步读大文件、<Code>Thread.Sleep</Code>。主线程出不了这一步，渲染也走不到。
              </Text>
              <Text size="small" tone="secondary">
                看起来像「协程没用」，其实是你把人和工单重新绑死了。等 IO 要用 <Code>UnityWebRequest</Code> 或 <Code>await</Code>，不要同步堵。
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Callout tone="warning" title="和「算用线程、等用协程」怎么对上">
        Unity 里「等」优先用协程或 async，而且等完还能直接改场景。重 CPU 才需要工作线程；算完必须回到主线程再改物体。协程本身不会帮你用上第二颗核。
      </Callout>
    </Stack>
  );
}

function PickView({
  wait,
  onWait,
}: {
  wait: WaitKind;
  onWait: (value: WaitKind) => void;
}) {
  const pick = recommend(wait);

  return (
    <Stack gap={20}>
      <Stack gap={8}>
        <H2>这段代码现在卡在哪种事上</H2>
        <Text tone="secondary">按本项目会遇到的四种情况选，不要按其他语言的线程池模型套。</Text>
        <Row gap={8} wrap>
          <span>
            <Pill active={wait === "frame"} onClick={() => onWait("frame")}>
              等一帧 / 等条件 / 等动画
            </Pill>
          </span>
          <span>
            <Pill active={wait === "http"} onClick={() => onWait("http")}>
              等登录 / HTTP / 下文件
            </Pill>
          </span>
          <span>
            <Pill active={wait === "cpu"} onClick={() => onWait("cpu")}>
              主线程算太久要掉帧
            </Pill>
          </span>
          <span>
            <Pill active={wait === "room"} onClick={() => onWait("room")}>
              房间要隔离、独立服
            </Pill>
          </span>
        </Row>
      </Stack>

      <Callout tone={pick.tone} title={pick.title}>
        {pick.body}
      </Callout>

      <Table
        headers={["情况", "用", "不要"]}
        rows={[
          [
            "等原点、等场景、等 1 秒再回主页",
            "StartCoroutine + yield return null / WaitForSeconds",
            "开线程去轮询 IsSet，然后在线程里 Instantiate",
          ],
          [
            "手机验证码、房间 HTTP",
            "async/await（PhoneLoginPanel）或 UnityWebRequest 协程",
            "同步 HttpClient.Get 堵在按钮回调里",
          ],
          [
            "SLAM / 编解码 / 大数组",
            "工作线程或原生插件，主线程只收结果",
            "指望 StartCoroutine 自动并行",
          ],
          [
            "一房间崩了别拖死别的房间",
            "独立进程（headless 一房间一进程）",
            "在玩法脚本里 fork，或用协程假装隔离",
          ],
        ]}
        striped
      />

      <Divider />

      <H3>Unity 协程 vs async/await</H3>
      <Table
        headers={["", "Unity 协程", "C# async/await"]}
        rows={[
          ["写法", "IEnumerator + yield return", "async Task + await"],
          ["谁唤醒", "PlayerLoop 每帧检查 yield 指令", "任务完成后由同步上下文回到主线程"],
          ["本项目", "GPS、POI、回主场景、SLAM 初始化", "PhoneLoginPanel、重连检查"],
          ["停掉", "StopCoroutine / 物体 Destroy", "CancellationToken"],
          ["选谁", "和帧、动画、场景绑在一起时", "和后端 HTTP、可取消请求绑在一起时"],
        ]}
        striped
      />
    </Stack>
  );
}

function recommend(wait: WaitKind): {
  tone: "info" | "success" | "warning";
  title: string;
  body: string;
} {
  if (wait === "frame") {
    return {
      tone: "success",
      title: "用 Unity 协程",
      body: "等下一帧、等 origin.IsSet、等动画播完、等 WaitForSeconds 再 DisconnectAndReturnToMain。全程在主线程，yield 之后可以直接改 Transform 和 UI。",
    };
  }
  if (wait === "http") {
    return {
      tone: "info",
      title: "用 async/await，或 UnityWebRequest 协程",
      body: "登录验证码这种后端往返用 await。Android 上从 StreamingAssets 拷文件用 yield return request.SendWebRequest()。不要在按钮点击里同步死等网络。",
    };
  }
  if (wait === "cpu") {
    return {
      tone: "warning",
      title: "协程救不了掉帧，要工作线程",
      body: "协程仍然占用主线程的时间片。真正费 CPU 的放到 Task.Run / 原生插件 / Job System，主线程只做「把结果写回物体」。写回必须回到主线程。",
    };
  }
  return {
    tone: "warning",
    title: "这是进程的事，不是协程的事",
    body: "独立服务器、一房间一进程、Editor 和真机分开跑，靠 OS 进程隔离。协程隔离不了崩溃，也隔离不了内存。玩法脚本里不要自己起进程。",
  };
}

function ProjectView() {
  return (
    <Stack gap={16}>
      <H2>本项目里三层各管什么</H2>
      <Text tone="secondary">下面都是 Assets/Scripts 里已经在用的，不是其他引擎的例子。</Text>

      <Table
        headers={["层", "文件", "在干什么"]}
        rows={[
          [
            "协程",
            "PlayerSetup.CoGetGPSAndPlace / CoSyncLocalGpsTargetToServer",
            "等 GPS 物体就绪，再按间隔把位置同步给主机。yield return null / WaitForSeconds。",
          ],
          [
            "协程",
            "SpawnGate.WaitOriginThenPlace",
            "每帧问一次 origin.IsSet，原点有了再摆 POI。典型的「等条件」。",
          ],
          [
            "协程",
            "NGORunnerController.CoReturnToMain",
            "WaitForSecondsRealtime 之后断线回 main。等的是时间，不是线程。",
          ],
          [
            "协程 + IO",
            "SlamARPlacer.CopyConfigFiles",
            "UnityWebRequest 读 StreamingAssets，yield 等下载完再 WriteAllBytes。",
          ],
          [
            "async IO",
            "PhoneLoginPanel.SendCodeAsync",
            "await 后端发验证码。等的是 HTTP，续跑后改 UI。",
          ],
          [
            "主线程网络回调",
            "PropEffectSystem 的 ClientRpc",
            "RPC 包到达后在主线程执行，才能安全弹 Toast、播黑屏。",
          ],
          [
            "进程（运维）",
            "独立 NGO 房间进程",
            "一房间一个 headless Player 时，隔离的是进程。脚本层看不到 fork。",
          ],
        ]}
        striped
        stickyHeader
      />

      <Callout tone="info" title="读代码时怎么对号">
        看见 StartCoroutine，先找 yield：它在等帧、等秒、等请求，还是等某个 bool。看见 await，多半在等后端。看见 ServerRpc / ClientRpc，是网络把调用搬到另一台机器的主线程，不是本地协程。
      </Callout>
    </Stack>
  );
}
