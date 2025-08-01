import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  UsersIcon, 
  EditIcon, 
  TrashIcon,
  StarIcon,
  MessageCircleIcon,
  ExternalLinkIcon,
  AlertTriangleIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import { Event, EventFeedback } from '@/types/db-types';

interface EventWithDetails extends Event {
  registration_count?: number;
  user_registered?: boolean;
  user_feedback?: EventFeedback;
}

interface EventModalProps {
  event: EventWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: EventWithDetails) => void;
  onDelete?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
  currentUser: any;
  onRefresh: () => void;
}

export default function EventModal({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onRegister,
  currentUser,
  onRefresh
}: EventModalProps) {
  const supabase = useSupabase();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [userFeedback, setUserFeedback] = useState<EventFeedback | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const isEventCreator = currentUser?.id === event.organizer_id;
  const now = new Date();
  const eventEnd = new Date(event.end_time);
  const eventStart = new Date(event.start_time);
  const hasEventEnded = now > eventEnd;
  const canProvideRating = (currentUser?.role === 'student' || currentUser?.role === 'mentor') && hasEventEnded;
  const canComment = currentUser?.role === 'student' || currentUser?.role === 'mentor';

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      fetchUserFeedback();
    }
  }, [isOpen, event.id]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('event_feedback')
        .select(`
          *,
          users!event_feedback_user_id_fkey(display_name, role)
        `)
        .eq('event_id', event.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error in fetchComments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchUserFeedback = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('event_feedback')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (data) {
        setUserFeedback(data);
        setRating(data.rating || 0);
        setNewComment(data.comment || '');
      }
    } catch (error) {
      // No existing feedback is fine
    }
  };

  const handleSubmitFeedback = async () => {
    if (!currentUser) return;

    // Check if at least one field is provided
    if (!newComment.trim() && rating === 0) {
      toast.error('Please provide either a rating or comment');
      return;
    }

    try {
      setSubmittingFeedback(true);

      const feedbackData = {
        event_id: event.id,
        user_id: currentUser.id,
        comment: newComment.trim() || null,
        rating: canProvideRating && rating > 0 ? rating : null
      };

      if (userFeedback) {
        // Update existing feedback
        const { error } = await supabase
          .from('event_feedback')
          .update(feedbackData)
          .eq('id', userFeedback.id);

        if (error) throw error;
      } else {
        // Create new feedback
        const { error } = await supabase
          .from('event_feedback')
          .insert(feedbackData);

        if (error) throw error;
      }

      toast.success('Feedback submitted successfully!');
      fetchComments();
      fetchUserFeedback();
      onRefresh();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (currentRating: number, editable = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.div
            key={star}
            whileHover={editable ? { scale: 1.2 } : {}}
            whileTap={editable ? { scale: 0.9 } : {}}
          >
            <StarIcon
              className={`w-5 h-5 transition-colors ${
                star <= currentRating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              } ${editable ? 'cursor-pointer hover:text-yellow-400' : ''}`}
              onClick={editable ? () => setRating(star) : undefined}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  const getEventStatus = () => {
    if (hasEventEnded) {
      return { text: 'Event Ended', variant: 'destructive' as const };
    } else if (now >= eventStart) {
      return { text: 'Ongoing', variant: 'default' as const };
    } else {
      return { text: 'Upcoming', variant: 'secondary' as const };
    }
  };

  const eventStatus = getEventStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold">{event.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge>{event.event_type}</Badge>
                      <Badge variant={eventStatus.variant}>
                        {eventStatus.text}
                      </Badge>
                      <Badge variant="outline">{event.status}</Badge>
                    </div>
                  </div>
                  
                  {isEventCreator && (
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
                          <EditIcon className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button variant="destructive" size="sm" onClick={() => onDelete(event.id)}>
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Event Details */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {format(new Date(event.start_time), 'PPP')}
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(event.start_time), 'p')} - {format(new Date(event.end_time), 'p')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <MapPinIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        {event.is_online ? (
                          <div>
                            <div className="font-medium">Online Event</div>
                            {event.virtual_link && (
                              <a 
                                href={event.virtual_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 flex items-center transition-colors"
                              >
                                Join Link <ExternalLinkIcon className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="font-medium">
                            {event.physical_location || 'Location TBA'}
                          </div>
                        )}
                      </div>
                    </div>

                    {event.max_participants && (
                      <div className="flex items-center text-sm">
                        <UsersIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {event.registration_count || 0}/{event.max_participants} Registered
                          </div>
                        </div>
                      </div>
                    )}

                    {event.target_departments && event.target_departments.length > 0 && (
                      <div className="flex items-start text-sm">
                        <div className="mr-2 mt-0.5 text-muted-foreground">Target:</div>
                        <div className="flex flex-wrap gap-1">
                          {event.target_departments.map((dept, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.target_years && event.target_years.length > 0 && (
                      <div className="flex items-start text-sm">
                        <div className="mr-2 mt-0.5 text-muted-foreground">Years:</div>
                        <div className="flex flex-wrap gap-1">
                          {event.target_years.map((year, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              Year {year}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Registration Info */}
                  {event.registration_opens_at && (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <ClockIcon className="w-4 h-4 inline mr-2" />
                      Registration: {format(new Date(event.registration_opens_at), 'PPP')} 
                      {event.registration_closes_at && (
                        <> - {format(new Date(event.registration_closes_at), 'PPP')}</>
                      )}
                    </div>
                  )}
                </motion.div>

                <Separator />

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.description}</p>
                </motion.div>

                {/* Preparation Documents */}
                {event.preparation_docs && event.preparation_docs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-semibold mb-2">Preparation Materials</h3>
                    <div className="space-y-1">
                      {event.preparation_docs.map((doc, idx) => (
                        <a 
                          key={idx}
                          href={doc} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 flex items-center text-sm transition-colors"
                        >
                          <ExternalLinkIcon className="w-3 h-3 mr-1" />
                          Document {idx + 1}
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Registration Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {event.user_registered ? (
                    <div className="text-center">
                      {hasEventEnded ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <AlertTriangleIcon className="w-3 h-3 mr-1" />
                          Event has ended - You were registered
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          ✓ You are registered for this event
                        </Badge>
                      )}
                    </div>
                  ) : onRegister && !hasEventEnded && (currentUser?.role === 'student' || currentUser?.role === 'mentor') && (
                    <div>
                      <Button 
                        onClick={() => onRegister(event.id)}
                        disabled={event.max_participants ? (event.registration_count || 0) >= event.max_participants : false}
                        className="w-full"
                      >
                        {event.max_participants && (event.registration_count || 0) >= event.max_participants 
                          ? 'Event Full' 
                          : 'Register for Event'
                        }
                      </Button>
                    </div>
                  )}
                </motion.div>

                <Separator />

                {/* Comments and Feedback Section */}
                {canComment && (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-semibold flex items-center">
                      <MessageCircleIcon className="w-4 h-4 mr-2" />
                      Comments & Feedback
                    </h3>

                    {/* Feedback Form */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      {canProvideRating && (
                        <div>
                          <Label>Rate this event</Label>
                          {renderStars(rating, true)}
                        </div>
                      )}

                      <div>
                        <Label htmlFor="comment">Your Comment</Label>
                        <Textarea
                          id="comment"
                          placeholder="Share your thoughts about this event..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <Button 
                        onClick={handleSubmitFeedback}
                        disabled={submittingFeedback || (!newComment.trim() && rating === 0)}
                        className="w-full"
                      >
                        {submittingFeedback ? 'Submitting...' : userFeedback ? 'Update Feedback' : 'Submit Feedback'}
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {loadingComments ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        </div>
                      ) : comments.length > 0 ? (
                        comments.map((comment, index) => (
                          <motion.div 
                            key={comment.id} 
                            className="p-3 bg-background border rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{comment.users?.display_name || 'Anonymous'}</span>
                                <Badge variant="outline" className="text-xs">
                                  {comment.users?.role || 'User'}
                                </Badge>
                              </div>
                              {comment.rating && renderStars(comment.rating)}
                            </div>
                            {comment.comment && (
                              <p className="text-sm text-muted-foreground">{comment.comment}</p>
                            )}
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">
                          No comments yet. Be the first to share your thoughts!
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}