var Navbar = ReactBootstrap.Navbar,
Nav = ReactBootstrap.Nav,
Button = ReactBootstrap.Button;

class MissionNavItem extends React.Component{
    render() {
        return (
            <Nav.Item id={this.props.id}>
                <Nav.Link onClick={this.props.onclick}>{this.props.text}</Nav.Link>
            </Nav.Item>
        );
    }
}

class MAVLinkForm extends React.Component{
    api = `http://${document.getElementById("var").getAttribute("hostname")}:${document.getElementById("var").getAttribute("port")}`;

    constructor(props) {
        super(props);
        this.state = {
            launch: -1
        };
        this.startClick = this.startClick.bind(this);
        this.restartClick = this.restartClick.bind(this);
    }    


    startClick() {
        const { launch } = this.state;
        var requestOption = {};

        if (launch == 1) {
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 0})
            };
        } else {
            requestOption = {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                   },
                body: JSON.stringify({ command: 1 })
            };
        };
        fetch(this.api+"/mavlink", requestOption);
    }

    restartClick() {
        var requestOption = {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        fetch(this.api+"/restart", requestOption);
    }

    render() {
        const { launch } = this.state;
        var content_style = {
            display: "inline-grid",
            overflow: "hidden",
            width: `${document.body.clientWidth - this.props.nav_ref.current.offsetWidth -60}px`,
            marginLeft: `${this.props.nav_ref.current.offsetWidth + 30}px`
        };
        fetch(this.api+"/status")
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              launch: result.launch
            });
          }
        );

        var start_button = <Button></Button>
        if (launch == 1) {
            start_button = <Button id="start_server" variant="outline-danger" onClick={this.startClick}>Выключить сервер</Button>
        } else {
            start_button = <Button id="start_server" variant="outline-success" onClick={this.startClick}>Запустить сервер</Button>
        }

        return (
            <div style={content_style}>
                <h1 id="formh1">Управление сервером MAVLink</h1>
                {start_button}
                <Button id="restart" variant="outline-primary" onClick={this.restartClick}>Перезагрузить плату</Button>
            </div>
        );
    }
}

class PreflightForm extends React.Component {
    api = `http://${document.getElementById("var").getAttribute("hostname")}:${document.getElementById("var").getAttribute("port")}/preflight`

    constructor(props) {
        super(props);
        this.state = {
            preflight_clicked: false,
            mag: -1,
            navigation: -1,
            status: -1
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
            if ((this.state.mag != 1) & (this.state.navigation != 1)){
                fetch(this.api)
                    .then(res => res.json())
                    .then(
                        (result) => {
                            this.setState({
                                mag: result.mag,
                                navigation : result.navigation,
                                status: result.status
                            })
                        }
                    );
            }
            var magimg = "";
            var navimg = "";
            var warning = [];
            if (this.state.status == 1) {
                if (this.state.mag == 1) {
                    magimg = "/static/img/ok.svg";
                } else {
                    magimg = "/static/img/bad.svg";
                    warning.push(<li>Параметр Imu_mag_Enabled не равен 0</li>);
                }

                if (this.state.navigation == 1) {
                    navimg = "/static/img/ok.svg";
                } else {
                    navimg = "/static/img/bad.svg";
                    warning.push(<li>Переключите систему позиционирования на GPS</li>);
                }
            } else {
                magimg = "/static/img/bad.svg";
                navimg = "/static/img/bad.svg";
                if (this.state.status == 2) {
                    warning.push(<li>Сервер MAVLink не включен, перейдите во вкладку Управление и запустите сервер</li>)
                } else if (this.state.status == 0) {
                    warning.push(<li>Система запускается. Немного подождите и выполните проверку снова</li>)
                } else {
                    warning.push(<li>Произошел сбой в работе Mission Control</li>)
                }
            }

            if (warning.length == 0) {
                var warning_div = <div id="warnings">
                    <h2>Предупреждения:</h2>
                    Нет
                </div>;
            } else {
            var warning_div = <div id="warnings">
                <h2>Предупреждения:</h2>
                <ul>
                    {warning}
                </ul>
            </div>;
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
                <br></br>
                {warning_div}
            </div>;
            if ((this.state.mag != -1) & (this.state.navigation != -1)) {
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
                    <MissionNavItem id="preflight" text="Подготовка" onclick={() => ReactDOM.render(<PreflightForm nav_ref={this.myInput}/>, document.getElementById("content"))}/>
                    <MissionNavItem id="manage" text="Управление" onclick={() => ReactDOM.render(<MAVLinkForm nav_ref={this.myInput}/>, document.getElementById("content"))}/>
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