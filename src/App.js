import './App.css';
import React from "react";
import TextareaAutosize from "react-autosize-textarea";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class App extends React.Component {
    constructor(props) {
        super(props);

        if (!window.google) {
            window.google = {
                colab: {
                    kernel: {
                        invokeFunction: async (fname, args) => {
                            await sleep(1000)

                            return {
                                data: {
                                    'application/json': {
                                        'result': args[0] + " test"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.state = {
            value: '',
            /*
              Saving the "ref" in the state is a bad practice: you should use a `const` or a class property.
              We're doing it as it's the only way we have to avoid
              resetting it to "React.createRef()" at every render
            */
            ref: React.createRef()
        };

    }

    render() {
        return (
            <div className="App">

                <TextareaAutosize
                    style={{ width:"100%" }}
                    rows={10}
                    onKeyDown={(evt) => {
                        if (evt.shiftKey && evt.keyCode === 9 ||
                            evt.ctrlKey && evt.keyCode == 32) {

                            const resultProm = window.google.colab.kernel.invokeFunction(
                                'notebook.Concat', // The callback name.
                                [this.state.value], // The arguments.
                                {}); // kwargs

                            this.setState({loading: true})

                            resultProm.then(result => {
                                console.log(result)
                                const text = result.data['application/json'];
                                this.setState({
                                    loading: false,
                                    value: text.result
                                }, () => {
                                    this.state.ref.current && this.state.ref.current.focus()
                                })
                            })

                            evt.preventDefault()
                            evt.stopPropagation()
                        }
                    }}
                    disabled ={this.state.loading}
                    value={this.state.value}
                    onChange={e => this.setState({value: e.currentTarget.value})}
                    placeholder="try writing some lines"
                    ref={this.state.ref}
                />
                {/*{this.state.ref.current && <div>The textarea contains: {this.state.ref.current.value}</div>}*/}
            </div>
        );
    }
}

export default App;
