import { defineComponent, h } from 'vue'
import { Signal } from './signal'

export const HookSignal = defineComponent({
  props: {
    signals: {
      type: Array<Signal<any>>,
    },
  },
  data: () => ({
    state: {},
    disposes: <(() => void)[]>[],
  }),
  mounted() {
    this.disposes =
      this.signals?.map((signal) =>
        signal.hook(() => {
          this.forceUpdate()
        })
      ) || []
  },
  unmounted() {
    this.disposes.forEach((dispose) => dispose())
  },
  methods: {
    forceUpdate() {
      this.state = {}
    },
  },
  render() {
    return h(this.$slots.default!, { forceUpdateState: this.state })
  },
})
