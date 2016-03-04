import React from 'react';
import moment from 'moment';

const PostType={
    TEXT: 1,
    STAMP: 2,
    IMAGE: 3,
    QUOTE: 4,
    RETALK: 5,
    MOVIE: 6,
    TEXT_IMAGE: 7,
    TEXT_MOVIE: 8,
    NEWS: 9,
    RETALK_TEXT: 10
}

const BodyType = {
    TEXT: 1,
    STAMP: 2,
    IMAGE: 3,
    QUOTE: 4,
    RETALK: 5,
    USER: 6,
    POST: 7,
    MOVIE: 8,
    NEWS: 9
}

class TalkPost extends React.Component {
    constructor(props) {
        super(props);
    }

    translateTextCursor: 0

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
        else if(postType === 5){
            // skip generate response
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

    getImageComponent(){
        var {post} = this.props;
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

    renderRetalkPostContent(){
        let body = this.props.post.body[0];
        let postContent = [];
        let translateContent = [];

        postContent = body.post.body.map(b=>{
            switch(b.bodyType) {
                case BodyType.TEXT:
                    return (
                        <span className="Linkify">
                            <span>{b.text}</span>
                        </span>
                    )
                case BodyType.NEWS:
                    return (
                        <div className="TalkPost__newsWrapper">
                            <div className="TalkPost__media">
                                <img src={b.image} />
                            </div>
                            <div className="TalkPost__news">
                                <div className="TalkPost__newsTitle">{b.title}</div>
                                <div className="TalkPost__newsDescription">{b.detail}</div>
                            </div>
                        </div>
                    )
            }
        })

        translateContent = body.post.body.map(b=>{
            switch(b.bodyType) {
                case BodyType.TEXT:
                    return (
                        <span className="Linkify" style={{color: 'red'}}>
                            <span>{b.trans}</span>
                        </span>
                    )
                }
            }
        )

        postContent = postContent.concat(<br/>).concat(translateContent);
        return postContent;
    }



    renderTalkPost(){
        let {isFirst, post, user} = this.props;
        let containerClass = isFirst?'TalkPost--dayStart':'TalkPost--start';
        let dateString = moment.unix(post.time).format('YYYY/MM/DD');
        let postTimeString = moment.unix(post.time).format('HH:mm:ss');

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
        );
    }

    renderRetalkPost(){
        let {isFirst, post, user} = this.props;
        let originSender = this.props.post.body[0].user;
        let containerClass = isFirst?'RetalkPost--dayStart':'RetalkPost--start';
        let dateString = moment.unix(post.time).format('YYYY/MM/DD');
        let postTimeString = moment.unix(post.time).format('HH:mm:ss');

        return (
            <div className={containerClass} data-date={dateString}>
                <div className="RetalkPost__icon">
                    <svg viewBox="0 0 128 128">
                        <path d="M108.04 69.607v37.802H73.143V77.563c0-16.158 1.92-27.857 5.79-35.093 5.056-9.646 13.086-16.934 24.05-21.88l7.95 12.66c-6.622 2.774-11.5 6.9-14.652 12.395-3.13 5.483-4.876 13.474-5.234 23.962h16.994zm-56.055 0v37.802h-34.92V77.563c0-16.158 1.926-27.857 5.79-35.093 5.057-9.646 13.087-16.934 24.052-21.88l7.975 12.66c-6.643 2.774-11.525 6.9-14.656 12.395-3.153 5.483-4.898 13.474-5.257 23.962h17.015z" />
                    </svg>
                </div>
                <div className="RetalkPost__header">
                    <div className="RetalkPost__username">
                        <span>{user.name}</span>
                        <span>转发</span>
                    </div>
                    <time className="RetalkPost__time">{postTimeString}</time>
                </div>
                <div className="RetalkPost__container">
                    <div className="RetalkPost__body">
                        <div className="RetalkPost__content">
                            <div className="RetalkPost__userInfo">
                                <a>
                                    <img className="thumb thumb--x-small RetalkPost__userImage" src={originSender.thumbnailUrl}/>
                                </a>
                                <div className="RetalkPost__username">{originSender.name}</div>
                            </div>
                            {this.renderRetalkPostContent()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render(){
        let {post} = this.props;

        if ([PostType.RETALK, PostType.RETALK_TEXT].includes(post.postType)) {
            return this.renderRetalkPost();
        }
        return this.renderTalkPost();
    }
}

export default TalkPost;


