var Navbar = ReactBootstrap.Navbar,
Nav = ReactBootstrap.Nav,
Button = ReactBootstrap.Button;

class MissionNavItem extends React.Component{
    render() {
        return (
            <Nav.Item className={this.props.class}>
                <Nav.Link onClick={this.props.onclick}>{this.props.text}</Nav.Link>
            </Nav.Item>
        );
    }
}

class MAVLinkForm extends React.Component{
    constructor(props) {
        super(props);
        this.start_click = this.start_click.bind(this);
        this.restart_click = this.restart_click.bind(this);
    }    


    start_click() {

    }

    restart_click() {

    }

    render() {
        var content_style = {
            display: "inline-grid",
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth -60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };

        var vars = document.getElementById("var");
        return (
            <div style={content_style}>
                <h1 id="formh1">Управление сервером MAVLink</h1>
                <Button id="start_server" variant="outline-success">Запустить сервер</Button>
                <Button id="restart" variant="outline-primary">Перезагрузить плату</Button>
            </div>
        );
    }
}

class PreflightForm extends React.Component {
    api = `http://${document.getElementById("var").getAttribute("hostname")}:${document.getElementById("var").getAttribute("port")}/status`

    constructor(props) {
        super(props);
        this.state = {
            preflight_clicked: false,
            mag: -1,
            navigation: -1

        };
        this.preflight_click = this.preflight_click.bind(this);
        this.props.check = <div></div>;
    }

    preflight_click() {
        this.setState({
            preflight_clicked: true
        });
    }

    render () {
        var content_style = {
            display: "inline-grid",
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth - 60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };

        var text = '';
        if (!this.state.preflight_clicked) {
            text = 'Выполнить подготовку';
        } else {
            text = 'Выполняем проверку';
            if ((this.state.mag != 1) || (this.state.navigation != 1)){
                fetch(this.api)
                    .then(res => res.json())
                    .then(
                        (result) => {
                            this.setState({
                                mag: result.mag,
                                navigation : result.navigation
                            })
                        }
                    );
            }
            var magimg = "";
            if (this.state.mag == 1) {
                magimg = "/static/img/ok.svg";
            } else {
                magimg = "/static/img/bad.svg";
            }

            var navimg = "";
            if (this.state.navigation == 1) {
                navimg = "/static/img/ok.svg";
            } else {
                navimg = "/static/img/bad.svg";
            }

            this.props.check = <div>
                <h2>Статус проверки:</h2>
                <div id="mag_status">
                    <img
                        src={magimg}
                        width="20"
                        height="20"
                    />
                    <a id="mag_text">Магнитометр</a>
                </div>
                <div id="nav_status">
                    <img
                        src={navimg}
                        width="20"
                        height="20"
                    />
                    <a id="nav_text">Система позиционирования</a>
                </div>
            </div>;
            if ((this.state.mag == 1) & (this.state.navigation == 1)) {
                this.setState({
                    preflight_clicked: false,
                    mag: -1,
                    navigation: -1
                });
            }
        }

        return (
            <div style={content_style}>
                <h1 id="formh1">Предполетная подготовка</h1>
                <Button id="preflight" variant="outline-success" disabled={this.state.preflight_clicked} onClick={this.preflight_click}>{text}</Button>
                <br></br>
                {this.props.check}
            </div>
        );
    }
}

class MissionNav extends React.Component {
    constructor(props, context) {
		super(props, context);
        this.myInput = React.createRef();
	}
    
    render() {
        return (
            <Navbar ref={this.myInput} id="mainnav" bg="light" className="scroll">
                <Navbar.Brand>
                    {/* <img
                        src="/static/img/logo.svg"
                        width="200"
                        height="50"
                    /> */}
                    Mission Control
                </Navbar.Brand>
                <Nav id="menu">
                    <MissionNavItem text="Управление сервером MAVLink" onclick={() => ReactDOM.render(<MAVLinkForm nav_ref={this.myInput}/>, document.getElementById("content"))}/>
                    <MissionNavItem text="Предполетная подготовка" onclick={() => ReactDOM.render(<PreflightForm nav_ref={this.myInput}/>, document.getElementById("content"))}/>
                </Nav>
            </Navbar>
        )
    }
}

class App extends React.Component {
    render() {
        return (
            <div>
                <MissionNav/>
                <div id="content"/>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);