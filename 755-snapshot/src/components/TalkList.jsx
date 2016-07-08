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

const UserType = {
  NORMAL: 0,
  OFFICIAL: 1
}

export default class TalkList extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
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

      if ([BodyType.IMAGE].includes(bodyType)) {
        // ignore image
        return null;
      }

      // if not translatable content manipulate by common render
      return this._renderPostBody(body)
    }
  }

  _renderPostBody(body, baseClass){
    const {extendContents} = this.props;
    let {bodyType} = body;
    let urlMatch = /https?:\/\/[^\s\.]+\.\S{2}\S*/.exec(body.text);


    if (urlMatch) {
      let matchedUrl = urlMatch[0];
      // find matched extend data
      const matched = extendContents.find(ec=>ec.url === matchedUrl);
      let ecImg;
      let ecTitle = '';
      let ecDescription = '';

      if (matched) {
        if (!matched.content.data) {
          console.log(JSON.stringify(matched));
        }
        ecImg = matched.content.data.image;
        ecTitle = matched.content.data.title;
        ecDescription = matched.content.data.description;
      }

      return (
        <span className="Linkify">
          <a>{body.text}</a>
          <a className="media OpenGraphCard">
            <div className="media__image OpenGraphCard__thumbnail" style={{backgroundImage: `url(${ecImg})`}}/>
            <div className="media__body OpenGraphCard__content">
              <div>
                <div className="OpenGraphCard__title">{ecTitle.substr(0, 25)}</div>
                <div className="OpenGraphCard__description">{ecDescription}</div>
              </div>
              <div className="OpenGraphCard__domain">
                <img className="OpenGraphCard__favicon" src="https://www.google.com/s2/favicons?domain=plus.google.com"/>
                plus.google.com
              </div>
            </div>
          </a>
        </span>
      );
    }
    else if (bodyType === BodyType.TEXT) {
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
        <img src={body.image} className={baseClass}/>
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
    else if (bodyType === BodyType.NEWS){
      console.log(body);
      return (
        null
      )
    }
  }

  _renderTalkPostTextContent(post){
    return [
      post.body.map(b=>this._renderPostBody(b)),
      <br />,
      post.body.map(b=>this._renderTranslate(b))
    ];
  }

  _renderTalkpostStampContent(post, baseClass){
    let stampClassName = `${baseClass}__stamp`;
    return post.body.map(b=>this._renderPostBody(b, stampClassName));
  }

  _renderUserInfoPart(baseClass, user){
    let isOfficialUser = (user.userType === UserType.OFFICIAL);

    return (
      <div className={`${baseClass}__userInfo`}>
        <a>
          <img className={`thumb thumb--x-small ${baseClass}__userImage`} src={user.thumbnailUrl} />
        </a>
        <div className="u-center-start">
          <div className={`${baseClass}__username`}>
            {user.name}
          </div>
          {isOfficialUser && (
            <div className="TalkPostQuote__officialIcon">
              <svg viewBox="0 0 128 128">
                <path d="M121.36 62.75l-7.7-19.368-8.217-19.06a3.387 3.387 0 0 0-1.767-1.765l-19.144-8.252-19.28-7.667a3.418 3.418 0 0 0-2.502 0l-19.37 7.71-19.055 8.21a3.41 3.41 0 0 0-1.77 1.765l-8.248 19.15L6.64 62.748a3.387 3.387 0 0 0 0 2.503l7.705 19.375 8.21 19.046a3.403 3.403 0 0 0 1.77 1.77l19.148 8.257 19.277 7.66c.4.162.824.24 1.25.24.423 0 .845-.078 1.25-.24l19.375-7.697 19.05-8.218a3.38 3.38 0 0 0 1.768-1.77l8.256-19.14 7.66-19.282a3.43 3.43 0 0 0 0-2.504" fill="#F9716D"/>
                <path d="M56.692 88.926a4.71 4.71 0 0 1-3.328-1.378L36.877 71.06l6.66-6.655 12.574 12.57 27.376-37.9 7.638 5.512L60.51 86.972a4.69 4.69 0 0 1-3.443 1.937 3.685 3.685 0 0 1-.375.016" fill="#FFF" />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  }

  _renderTalkPostQuoteContent(post, baseClass){
    let {body} = post;
    let commentObj = body[0];
    let {user} = commentObj.comment;
    let replyBody = body.slice(1, body.length);

    return [
        <div className={`${baseClass}Quote aa`}>
          {this._renderUserInfoPart(`${baseClass}Quote`, user)}
          <div className={`${baseClass}Quote__text`}>
            {this._renderPostBody(commentObj)}
            <br />
            {this._renderTranslate(commentObj)}
          </div>
        </div>,
        replyBody.map(b=>this._renderPostBody(b)),
        <br />,
        replyBody.map(b=>this._renderTranslate(b))
    ]
  }

  _renderTalkPostRetalkContent(post){
    let retalkPost = post.body[0].post;
    return this._renderTalkPostContent(retalkPost, true)
  }

  // TalkPost RetalkPost
  _renderTalkpostMovieContent(post){
    return post.body.map(b=>this._renderPostBody(b));
  }

  _renderTalkPostTextImageContent(post){
    return [
      post.body.map(b=>this._renderPostBody(b)),
      <br />,
      post.body.map(b=>this._renderTranslate(b))
    ];
  }

  _renderTalkPostNewsContent(post){
    const body = post.body[0];
    return [
      (<div className="TalkPost__media">
        <img src={body.image} />
      </div>),
      (<div className="TalkPost__news">
        <div className="TalkPost__newsTitle">{body.title}</div>
        <div className="TalkPost__newsDescription">{body.detail}...</div>
      </div>)

    ]
    // return this._renderPostBody(post.body[0])
  }

  _renderTalkPostContent(post, isRetalkPost){
    let {postType} = post;
    let baseClass = isRetalkPost ? 'RetalkPost' : 'TalkPost';

    if(postType === PostType.TEXT){
      // if (isRetalkPost) {
      //   return this._renderTalkPostTextContent(post, baseClass);
      // }
      return (
        <div className={`${baseClass}__content 1`}>
          {this._renderTalkPostTextContent(post, baseClass)}
        </div>
      );
    }
    else if (postType === PostType.STAMP){
      return (
        <div className={`${baseClass}__content--stamp`}>
          {this._renderTalkpostStampContent(post, baseClass)}
        </div>
      );
    }
    else if (postType === PostType.IMAGE){
      return (
        <div className={`${baseClass}__content 2`}>
          {this._renderTalkPostTextImageContent(post, baseClass)}
        </div>
      );
    }
    else if (postType === PostType.QUOTE) {
      if (isRetalkPost) {
        return this._renderTalkPostQuoteContent(post, 'TalkPost');
      }
      return (
        <div  className={`${baseClass}__content 3`}>
          {this._renderTalkPostQuoteContent(post, baseClass)}
        </div>
      )
    }
    else if (postType === PostType.RETALK) {
      return this._renderTalkPostRetalkContent(post);
    }
    else if (postType === PostType.MOVIE){
      return (
        <div className={`${baseClass}__content--media`}>
          {this._renderTalkpostMovieContent(post, baseClass)}
        </div>
      );
    }
    else if (postType === PostType.TEXT_IMAGE){
      return (
        <div className={`${baseClass}__content--media`}>
          {this._renderTalkPostTextImageContent(post, baseClass)}
        </div>
      );
    }
    else if (postType === PostType.NEWS){
      return (
        <div className="TalkPost__newsWrapper">
          {this._renderTalkPostNewsContent(post)}
        </div>
      )
    }
    else{
      console.log('imimplemented post content: ', postType);
      return null;
    }
  }

  _renderTalkPost(postObj, {shouldShowDateTag, shouldCombindPost}){
    let {post, user} = postObj;
    // let talkPostClassName = 'TalkPost';
    let containerClassSuffix = '';
    if (shouldCombindPost) {
      // dummy do nothing
    }
    else if (shouldShowDateTag) {
      containerClassSuffix += '--dayStart';
    }
    else{
      containerClassSuffix += '--start';
    }
    let date = moment.unix(post.time).format('YYYY/MM/DD');
    let timeString = moment.unix(post.time).format('HH:mm:ss');

    if (post.postType === PostType.RETALK) {
      let postClassName = 'RetalkPost';
      return (
        <div className={`${postClassName}${containerClassSuffix}`} data-date={date} key={post.postId}>
          <div className="RetalkPost__icon">
            <svg viewBox="0 0 128 128">
              <path d="M108.04 69.607v37.802H73.143V77.563c0-16.158 1.92-27.857 5.79-35.093 5.056-9.646 13.086-16.934 24.05-21.88l7.95 12.66c-6.622 2.774-11.5 6.9-14.652 12.395-3.13 5.483-4.876 13.474-5.234 23.962h16.994zm-56.055 0v37.802h-34.92V77.563c0-16.158 1.926-27.857 5.79-35.093 5.057-9.646 13.087-16.934 24.052-21.88l7.975 12.66c-6.643 2.774-11.525 6.9-14.656 12.395-3.153 5.483-4.898 13.474-5.257 23.962h17.015z" data-reactid="826"></path>
            </svg>
          </div>
          <div className="RetalkPost__header">
            <div className="RetalkPost__username">
              {user.name}转发了
            </div>
            <div className="TalkPost__time">{timeString}</div>
          </div>
          <div className="RetalkPost__container">
            <div className="RetalkPost__body">
              <div className="RetalkPost__content">
                {this._renderUserInfoPart('RetalkPost', post.body[0].user)}
                {this._renderTalkPostContent(post)}
              </div>
            </div>
          </div>
        </div>
      );
    }
    else{
      let postClassName = 'TalkPost'
      return (
        <div className={`${postClassName}${containerClassSuffix}`} data-date={date} key={post.postId}>
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
