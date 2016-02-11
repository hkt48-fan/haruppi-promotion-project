import React from 'react';
import TalkPost from './TalkPost';

class FullPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        var {posts} = this.props;

        var body = posts.reverse().map((p, i)=>{
                return <TalkPost key={i} isFirst={i === 0} {...p} />
            });

        return (
            <html>
                <head>
                    <meta charSet="UTF-8" />
                    <link href="app.min.css" rel="stylesheet"/>
                </head>

                <body>

                    <div className="TalkPage__TalkList" style={{
                        // paddingLeft: '80px',
                        // display:'block',
                        paddingBottom: '50px',
                        width: '600px'}}>
                        {body}
                    </div>

                </body>

            </html>
        )
    }
}

export default FullPage;