import React from 'react';
import moment from 'moment';
import tp from '../libs/TranslatePool';

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

export default class TalkList extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  _renderTranslate(body){
    let {bodyType} = body;
    let originalText;
    if (bodyType === BodyType.TEXT) {
      originalText = body.text;
    }
    else if (bodyType === BodyType.QUOTE){
      originalText = body.comment.comment.body;
    }

    if (originalText) {
      return (
        <span className="tranlate-text">
          {tp.getTranslateText(originalText)}
        </span>
      )
    }
    else{
      // if not translatable content manipulate by common render
      return this._renderPostBody(body)
    }
  }

  _renderPostBody(body, className){
    let {bodyType} = body;
    if (bodyType === BodyType.TEXT) {
      let textArray = body.text.split('\n');
      let textComponents = [];
      textArray.forEach((t,i)=>{
        if (i !== 0) {
          textComponents.push(<br/>);
        }
        textComponents.push(<span>{t}</span>);
      })

      return (
        <span className="Linkify">
          {textComponents}
        </span>
      )
    }
    if (bodyType === BodyType.STAMP) {
      return (
        <img src={'https:' + body.image} className={className}/>
      );
    }
    else if (bodyType === BodyType.IMAGE){
      return (
        <div className="TalkPost__media">
          <img src={body.image}/>
        </div>
      )
    }
    else if (bodyType === BodyType.QUOTE){
      return (
        <span className="Linkify">
          {body.comment.comment.body}
        </span>
      )
    }
    else if (bodyType === BodyType.MOVIE){
      return (
        <div className="TalkPost__media">
          <img src={body.thumbnailUrl} controls={true}/>
        </div>
      )
    }
  }

  _renderTalkPostTextContent(post){
    return (
      <div className="TalkPost__content">
        {post.body.map(b=>this._renderPostBody(b))}
        <br />
        {post.body.map(b=>this._renderTranslate(b))}
      </div>
    );
  }

  _renderTalkpostStampContent(post){
    let stampClassName = 'TalkPost__stamp';
    return (
      <div className="TalkPost__content--stamp">
        {post.body.map(b=>this._renderPostBody(b, stampClassName))}
      </div>
    );
  }

  _renderTalkPostQuoteContent(post){
    let {body} = post;
    let commentObj = body[0];
    let {comment, user} = commentObj.comment;
    let replyBody = body.slice(1, body.length);

    return (
      <div className="TalkPost__content">
        <div className="TalkPostQuote">
          <div className="TalkPostQuote__userInfo">
            <a>
              <img className="thumb thumb--x-small TalkPostQuote__userImage" src={user.thumbnailUrl} />
            </a>
            <div className="u-center-start">
              <div className="TalkPostQuote__username">
                {user.name}
              </div>
            </div>
          </div>
          <div className="TalkPostQuote__text">
            {this._renderPostBody(commentObj)}
            <br />
            {this._renderTranslate(commentObj)}
          </div>
        </div>
        {replyBody.map(b=>this._renderPostBody(b))}
        <br />
        {replyBody.map(b=>this._renderTranslate(b))}
      </div>
    );
  }

  _renderTalkpostMovieContent(post){
    return (
      <div className="TalkPost__content--media">
        {post.body.map(b=>this._renderPostBody(b))}
      </div>
    );
  }

  _renderTalkPostTextImageContent(post){
    return (
      <div className="TalkPost__content">
        <div className="TalkPost__content--media">
          {post.body.map(b=>this._renderPostBody(b))}
          <br />
          {post.body.map(b=>this._renderTranslate(b))}
        </div>
      </div>
    );
  }

  _renderTalkPostContent(post){
    let {postType} = post;
    if(postType === PostType.TEXT){
      return this._renderTalkPostTextContent(post);
    }
    else if (postType === PostType.STAMP){
      return this._renderTalkpostStampContent(post);
    }
    else if (postType === PostType.IMAGE){
      return this._renderTalkPostTextImageContent(post);
    }
    else if (postType === PostType.QUOTE) {
      return this._renderTalkPostQuoteContent(post);
    }
    else if (postType === PostType.MOVIE){
      return this._renderTalkpostMovieContent(post);
    }
    else if (postType === PostType.TEXT_IMAGE){
      return this._renderTalkPostTextImageContent(post);
    }
    else{
      console.log('imimplemented post content: ', postType);
      return null;
    }
  }

  _renderTalkPost(postObj, {shouldShowDateTag, shouldCombindPost}){
    let {post, user} = postObj;
    let talkPostClassName = 'TalkPost';
    if (shouldCombindPost) {
      // dummy do nothing
    }
    else if (shouldShowDateTag) {
      talkPostClassName += '--dayStart';
    }
    else{
      talkPostClassName += '--start';
    }
    let date = moment.unix(post.time).format('YYYY/MM/DD');
    let timeString = moment.unix(post.time).format('HH:mm:ss');

    return (
      <div className={talkPostClassName} data-date={date} key={post.postId}>
        <a>
           <img className="thumb thumb--small TalkPost__userImage" src={user.thumbnailUrl} />
        </a>

        <div className="TalkPost__body">
          <div className="TalkPost__header">
              <div className="TalkPost__username">{user.name}</div>
              <div className="TalkPost__time">{timeString}</div>
          </div>

          {this._renderTalkPostContent(post)}
        </div>

      </div>
    );

  }

  render() {
    let {posts, trans} = this.props;
    let lastTimestamp, lastPostUser;
    let shouldShowDateTag = false;
    let shouldCombindPost = false;
    tp.setTranslateList(trans);

    return (
      <div className="TalkPage__TalkList">
      {
        posts.map((postObj, index)=>{
          if (index === 0) {
            // first post, set the current lastTimestamp
            lastTimestamp = postObj.post.time;
            lastPostUser = postObj.user.userId;
            shouldShowDateTag = true;
          }
          else {
            shouldShowDateTag = !moment.unix(lastTimestamp).isSame(moment.unix(postObj.post.time), 'day');
            shouldCombindPost = ((postObj.post.time - lastTimestamp)<60) && (lastPostUser === postObj.user.userId);

            lastTimestamp = postObj.post.time;
            lastPostUser = postObj.user.userId;
          }
          return this._renderTalkPost(postObj, {shouldShowDateTag, shouldCombindPost});
        })
      }
      </div>
    )
  }
}
