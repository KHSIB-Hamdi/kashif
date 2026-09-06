import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import Rating from '@mui/material/Rating';
import { fetchComments, addComment } from '../store/comment/commentActions';
import { styled } from '@mui/material/styles';
import { Button } from 'reactstrap';

const ChatContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '500px',
  overflowY: 'scroll',
  padding: '10px',
  border: '1px solid #dee2e6',
  borderRadius: '5px',
  backgroundColor: '#eef5f9',
  scrollbarWidth: 'thin',  // "auto", "thin", or "none"
  scrollbarColor: '#888 #f1f1f1',  // Scrollbar thumb and track colors
});

const MessageBubble = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '10px',
  padding: '10px',
  borderRadius: '15px',
  maxWidth: '70%',
  backgroundColor: '#ffffff',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
});

const UserName = styled('strong')({
  marginBottom: '5px',
  color: '#eb563d',
});

const SubjectText = styled('h3')({
  margin: 0,
  fontSize: '16px',
});

const MessageText = styled('p')({
  margin: 0,
  fontSize: '14px',
});

const ChatInputContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  padding: '10px',
  borderTop: '1px solid #dee2e6',
  backgroundColor: '#ffffff',
});

const StyledInput = styled('input')({
  flex: 1,
  marginTop: '10px',
  marginRight: '10px',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #dee2e6',
});

const SubjectInput = styled('input')({
    marginTop: '10px',
    marginRight: '10px',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
  });



function Chat() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const comments = useSelector(state => state.comment.comments);
  const [newComment, setNewComment] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    dispatch(fetchComments());
  }, [dispatch]);

  const formatDate = (timestamp) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
  };

  const handleAddComment = async () => {
    if (newComment.trim() && subject.trim()) {
      const commentData = {
        user: user.id,  // Assuming `user` is available from your authentication or context
        content: newComment,
        subject: subject
      };
  
      try {
        // Dispatch action to add a new comment
        await dispatch(addComment(commentData));
        setNewComment('');  // Clear input after adding the comment
        setSubject('');  // Clear subject input
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  return (
    <div className="row">
      <div className="col-lg-12">
        <nav className="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">Chat</li>
          </ol>
        </nav>
      </div>
      <div className="col-lg-12">
        <div className="card">
          <div className="card-title border-bottom p-3 mb-0">
            <i className="bi bi-chat-dots me-2"></i>
            Commentaires
          </div>
          <div className="card-body">
            <ChatContainer>
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <MessageBubble key={index}>
                    <UserName>{comment.user_username}</UserName>
                    <SubjectText>{comment.subject}</SubjectText>
                    <MessageText>{comment.content}</MessageText>
                    <small>{formatDate(comment.created_at)}</small>
                    <Rating
                      name={`rating-${index}`}
                      value={comment.rating || 0}
                      onChange={(event, newValue) => {
                        
                      }}
                    />
                  </MessageBubble>
                ))
              ) : (
                <p className="text-center">Pas de commentaires.</p>
              )}
            </ChatContainer>
            <ChatInputContainer>
            <SubjectInput
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter un sujet..."
              />
              <StyledInput
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Écrire un message..."
              />
              <Button className="btn" color="primary" style={{marginTop:"10px"}} onClick={handleAddComment}>
                Envoyer
              </Button>
            </ChatInputContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
