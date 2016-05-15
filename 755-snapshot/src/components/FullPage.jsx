import React from 'react';
import TalkList from './TalkList';

class FullPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        var {posts, trans} = this.props;

        return (
            <html>
                <head>
                    <meta charSet="UTF-8" />
                    <link href={`file://${__dirname}/../../app.min.css`} rel="stylesheet"/>
                    <link href={`file://${__dirname}/../../custom.css`} rel="stylesheet"/>
                </head>

                <body>
                        <div className="TalkPage__TalkList">
                            <TalkList posts={posts} trans={trans} />
                        </div>

                </body>

            </html>
        )
    }
}

export default FullPage;