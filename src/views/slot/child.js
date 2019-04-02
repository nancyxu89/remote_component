export default {
  functional: true,
  name: "child",
  props: ["obj"],
  render(h, c) {
    return h("span", [
      "------child.js-------",
      c.data.scopedSlots.default({ text: "from child" })
    ]);
  }
};
