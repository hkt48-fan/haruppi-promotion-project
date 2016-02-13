import React from 'react';
import moment from 'moment';

class TalkPost extends React.Component {
    constructor(props) {
        super(props);
    }

    getQuoteComponent(){
        var {post} = this.props;
        var {postType} = post;

        if (postType === 1) {
            return null;
        }
        else if(postType === 4){
            var {comment} = post.body[0];
            return (
                <div className="TalkPostQuote">
                    <div className="TalkPostQuote__userInfo">
                        <a>
                            <img className="thumb thumb--x-small TalkPostQuote__userImage" src={comment.user.thumbnailUrl}/>
                        </a>
                        <div className="TalkPostQuote__username">{comment.user.name}</div>
                    </div>

                    <div className="TalkPostQuote__text">
                        <span className="Linkify">{comment.comment.body}</span>
                        <br/>
                        <span className="Linkify" style={{color: 'red'}}>{comment.comment.trans}</span>
                    </div>
                </div>
            )
        }
    }

    getResponseComponent(){
        var {post} = this.props;
        var {postType} = post;


        var response = post.body;
        if (postType === 1) {
            // response = post.body;
        }
        else if(postType === 4){
            response = post.body.slice(1);
        }

        var result = response.map((r)=>{
            if (r.bodyType === 1) {
                var textArray = r.text.split('\n');
                var bodyComponents = [];

                textArray.forEach((text, i)=>{
                    if (i !== 0) {
                        bodyComponents.push(<br/>);
                    }
                    bodyComponents.push(
                        <span className="Linkify">
                            <span>{text}</span>
                        </span>
                    )
                });

                return bodyComponents;
            }
            else if(r.bodyType === 2){
                return(
                    <img src={`http:${r.image}`} />
                )
            }
            else if(r.bodyType === 3){
                return(
                    (<div className="TalkPost__media">
                        <img src={r.image} />
                    </div>)
                )
            }
        })

        var translate = response.map(r=>{
            if (r.bodyType === 1) {
                return(
                    <span className="Linkify" style={{color: 'red'}}>
                        <span>{r.trans}</span>
                    </span>
                )
            }
            else if(r.bodyType === 2){
                return(
                    <img src={`http:${r.image}`} />
                )
            }
        });


        result = result.concat(<br/>).concat(translate);
        // console.log(result);
        return result;
    }

    // renderPost(){
    //             var {post} = this.props;
    //     var {postType} = post;
    //     return (
    //         <div className="TalkPost__content">

    //         </div>
    //     )
    // }

    // renderRetalkPost(){

    // }
    getImageComponent(){
        var {post} = this.props;
        var {postType} = post;
        // return post;

        console.log(post.body[0].image);
        var imgUrl = `http:${post.body[0].image}`;
        return (<img className="TalkPost__stamp" src={imgUrl}></img>)
    }

    renderPostContent(){
        var {postType} = this.props.post;
        var postContent = [];

        var postContentClass = '';
        if (postType === 2){
            postContentClass = 'TalkPost__content--stamp';
            postContent = [].concat(this.getImageComponent());
        }
        else if (postType === 3) {
            postContentClass = 'TalkPost__content--media';
            postContent = [].concat(this.getQuoteComponent()).concat(this.getResponseComponent());
        }
        else{
            postContentClass = 'TalkPost__content';
            postContent = [].concat(this.getQuoteComponent()).concat(this.getResponseComponent());
        }
        return (
            <div className={postContentClass}>
                {postContent}
            </div>
        );
    }

    render(){
        var {isFirst, post, user} = this.props;

        var containerClass = isFirst?'TalkPost--dayStart':'TalkPost--start'

        var postTimeString = moment.unix(post.time).format('HH:mm:ss');
        var dateString = moment.unix(post.time).format('YYYY/MM/DD');

        // var quoteComponent = this.getQuoteComponent();
        // var responseComponent = this.getResponseComponent();

        return (
            <div className={containerClass} data-date={dateString}>
                <a>
                    <img className="thumb thumb--small TalkPost__userImage" src={user.thumbnailUrl} />
                </a>

                <div className="TalkPost__body">
                    <div className="TalkPost__header">
                        <div className="TalkPost__username">{user.name}</div>
                        <div className="TalkPost__time">{postTimeString}</div>
                    </div>
                    {this.renderPostContent()}
                </div>
            </div>
        )
    }
}

export default TalkPost;


