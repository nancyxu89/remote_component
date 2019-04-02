export default {
  name: "parent",
  props: {
    message: {
      type: String,
      default: ""
    },
    text: {
      type: String,
      default: "from parent component"
    }
  },
  render(createElement) {
    // `<div><slot :text="message"></slot></div>`
    // return createElement("div", [
    //   this.$scopedSlots.default({
    //     text: this.message
    //   })
    // ]);
    let elems = [];
    this.$scopedSlots.default
      ? elems.push(
          this.$scopedSlots.default({
            text: this.message
          })
        )
      : "";
    elems.push(
      createElement("child", {
        scopedSlots: {
          default: function(props) {
            return createElement("a", props.text);
          }
        }
      })
    );
    elems = elems.concat(this.$slots.default);
    return createElement("div", elems);
  }
};
