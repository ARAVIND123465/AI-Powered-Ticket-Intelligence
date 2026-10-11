import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { TICKET_CATEGORIES } from '@/constants';
import { Upload, FileText, X } from 'lucide-react';

const ticketSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  category: z.string().min(1, 'Please select a category'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  attachment: z.any().optional(),
});

export type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  onSubmit: (data: TicketFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<TicketFormData>;
}

export default function TicketForm({ onSubmit, isLoading, defaultValues }: TicketFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      name: '',
      email: '',
      category: 'Payment',
      subject: '',
      description: '',
      ...defaultValues,
    },
  });

  const selectedFiles = watch('attachment');
  const selectedFile = selectedFiles && (selectedFiles as FileList).length > 0 ? (selectedFiles as FileList)[0] : null;

  const categoryOptions = TICKET_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name"
          placeholder="Aravind"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="aravind@gmail.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          error={errors.category?.message}
          {...register('category')}
        />
        <Input
          label="Subject"
          placeholder="Payment Failed"
          error={errors.subject?.message}
          {...register('subject')}
        />
      </div>

      <Textarea
        label="Description"
        placeholder="Money deducted but order not confirmed."
        rows={5}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          Attachment (PDF or Screenshot)
        </label>
        {selectedFile ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.name.endsWith('.pdf') ? 'PDF Document' : 'Image'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValue('attachment', undefined)}
              className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative border border-dashed border-[var(--border-primary)] rounded-xl p-4 hover:bg-[var(--bg-tertiary)] transition-colors flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              accept=".pdf,image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              {...register('attachment')}
            />
            <Upload className="w-5 h-5 text-[var(--text-tertiary)] mb-1" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">Upload PDF or Screenshot</span>
            <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Supports PDF up to 10MB</span>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          Submit Ticket
        </Button>
      </div>
    </form>
  );
}

