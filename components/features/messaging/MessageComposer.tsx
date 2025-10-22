'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/helpers';
import {
  Send,
  Plus,
  Mic,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (message: string, attachments?: File[]) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

interface SelectedFile {
  file: File;
  preview?: string;
  type: 'file' | 'image' | 'audio';
}

export function MessageComposer({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = 'Type a message...',
}: MessageComposerProps) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    try {
      await onSendMessage(
        message,
        selectedFiles.map((f) => f.file)
      );
      setMessage('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: SelectedFile[] = files.map((file) => {
      let type: 'file' | 'image' | 'audio' = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('audio/')) type = 'audio';

      const selectedFile: SelectedFile = { file, type };

      // Create preview for images
      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (event) => {
          selectedFile.preview = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      return selectedFile;
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        setSelectedFiles((prev) => [
          ...prev,
          { file, type: 'audio' },
        ]);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      audioRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone permission required for voice messages');
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') {
      audioRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="border-t bg-background p-4 space-y-3">
      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((fileItem, index) => (
            <div
              key={index}
              className="relative inline-block bg-accent rounded-lg p-2"
            >
              {fileItem.type === 'image' && fileItem.preview ? (
                <img
                  src={fileItem.preview}
                  alt="Preview"
                  className="w-16 h-16 rounded object-cover"
                />
              ) : fileItem.type === 'audio' ? (
                <div className="w-16 h-16 rounded bg-secondary flex items-center justify-center">
                  <Mic className="w-5 h-5 text-secondary-foreground" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded bg-secondary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-secondary-foreground" />
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveFile(index)}
                className={cn(
                  'absolute -top-2 -right-2',
                  'w-5 h-5 rounded-full bg-destructive text-destructive-foreground',
                  'flex items-center justify-center',
                  'hover:bg-destructive/90 transition-colors'
                )}
              >
                <X className="w-3 h-3" />
              </button>

              {/* File Name */}
              <p className="text-xs text-muted-foreground truncate max-w-16 mt-1">
                {fileItem.file.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Attachment Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled || isLoading}
            className="hover:bg-accent"
            title="Add attachment"
          >
            <Plus className="w-5 h-5" />
          </Button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isLoading}
          />

          {/* File type buttons */}
          <div className="absolute bottom-full left-0 mb-2 flex flex-col gap-1 bg-popover border rounded-lg p-1 shadow-lg">
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={disabled || isLoading}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm rounded',
                'hover:bg-accent transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <ImageIcon className="w-4 h-4" />
              Image
            </button>
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              disabled={disabled || isLoading}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm rounded',
                'hover:bg-accent transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <FileText className="w-4 h-4" />
              File
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={disabled || isLoading}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-sm rounded',
                'hover:bg-accent transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isRecording && 'bg-red-100 text-red-900'
              )}
            >
              <Mic className="w-4 h-4" />
              {isRecording ? 'Stop' : 'Voice'}
            </button>
          </div>
        </div>

        {/* Message Input */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="flex-1"
        />

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={
            disabled ||
            isLoading ||
            (!message.trim() && selectedFiles.length === 0)
          }
          size="icon"
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600 px-2">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          Recording... Click the mic button to stop
        </div>
      )}
    </div>
  );
}
