import spx, { SPX } from 'spx';

export class Incremental extends spx.Component<typeof Incremental.define> {

  static define = {
    id: 'incremental',
    state: {
      label: String,
      color: String,
      count: Number
    },
    nodes: [
      'color',
      'count'
    ]
  };

  labelValue ({ attrs }: SPX.Event<{
    text: string;
  }>) {

    this.labelNode.innerText = attrs.text;

  }

  labelInput (event: SPX.InputEvent) {
    if (event.target instanceof HTMLInputElement) {

      this.labelNode.innerText = event.target.value;

    }
  }

  changeColor (event: SPX.InputEvent<{}, HTMLInputElement>) {

    this.state.color = event.target.value;
    this.colorNode.style.backgroundColor = this.state.color;

  }

  reset () {

    this.state.count = 0;

  }

  increment () {

    console.log('increment', this);

    ++this.state.count;

  }

  decrement () {

    console.log('decrement', this);

    --this.state.count;

  }

  /* -------------------------------------------- */
  /* NODES                                        */
  /* -------------------------------------------- */

  public colorNode: HTMLElement;
  public countNode: HTMLElement;
  public labelNode: HTMLElement;

}