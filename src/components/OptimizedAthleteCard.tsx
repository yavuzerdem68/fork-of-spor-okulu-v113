import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Edit,
  Eye,
  MoreVertical,
  UserCheck,
  UserX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLazyImage } from '@/utils/performance';

interface Athlete {
  id: string;
  studentName: string;
  studentSurname: string;
  studentAge?: string;
  sportsBranches?: string[];
  parentName: string;
  parentSurname: string;
  parentPhone: string;
  parentEmail?: string;
  city?: string;
  status: string;
  paymentStatus?: string;
  photo?: string;
  registrationDate?: string;
}

interface AthleteCardProps {
  athlete: Athlete;
  onEdit?: (athlete: Athlete) => void;
  onView?: (athlete: Athlete) => void;
  onToggleStatus?: (athlete: Athlete) => void;
  onDelete?: (athlete: Athlete) => void;
  className?: string;
}

const AthleteCard = memo(({ 
  athlete, 
  onEdit, 
  onView, 
  onToggleStatus, 
  onDelete,
  className = ""
}: AthleteCardProps) => {
  // Lazy load image
  const { imageSrc, isLoading: imageLoading, error: imageError } = useLazyImage(athlete.photo || '');

  // Memoized calculations
  const fullName = useMemo(() => 
    `${athlete.studentName} ${athlete.studentSurname}`, 
    [athlete.studentName, athlete.studentSurname]
  );

  const parentFullName = useMemo(() => 
    `${athlete.parentName} ${athlete.parentSurname}`, 
    [athlete.parentName, athlete.parentSurname]
  );

  const initials = useMemo(() => 
    `${athlete.studentName?.charAt(0) || ''}${athlete.studentSurname?.charAt(0) || ''}`.toUpperCase(),
    [athlete.studentName, athlete.studentSurname]
  );

  const statusColor = useMemo(() => {
    switch (athlete.status?.toLowerCase()) {
      case 'aktif':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pasif':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }, [athlete.status]);

  const paymentStatusColor = useMemo(() => {
    switch (athlete.paymentStatus?.toLowerCase()) {
      case 'güncel':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'gecikmiş':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'kısmi':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }, [athlete.paymentStatus]);

  const registrationDate = useMemo(() => {
    if (!athlete.registrationDate) return '';
    return new Date(athlete.registrationDate).toLocaleDateString('tr-TR');
  }, [athlete.registrationDate]);

  // Memoized event handlers
  const handleEdit = useCallback(() => {
    onEdit?.(athlete);
  }, [onEdit, athlete]);

  const handleView = useCallback(() => {
    onView?.(athlete);
  }, [onView, athlete]);

  const handleToggleStatus = useCallback(() => {
    onToggleStatus?.(athlete);
  }, [onToggleStatus, athlete]);

  const handleDelete = useCallback(() => {
    onDelete?.(athlete);
  }, [onDelete, athlete]);

  const handlePhoneClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${athlete.parentPhone}`, '_self');
  }, [athlete.parentPhone]);

  const handleEmailClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (athlete.parentEmail) {
      window.open(`mailto:${athlete.parentEmail}`, '_self');
    }
  }, [athlete.parentEmail]);

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="w-16 h-16">
              {!imageLoading && !imageError && imageSrc ? (
                <AvatarImage src={imageSrc} alt={fullName} />
              ) : (
                <AvatarFallback className="text-lg font-semibold">
                  {initials || <User className="w-6 h-6" />}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {fullName}
                </h3>
                {athlete.studentAge && (
                  <p className="text-sm text-muted-foreground">
                    {athlete.studentAge} yaş
                  </p>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={handleView}>
                      <Eye className="mr-2 h-4 w-4" />
                      Görüntüle
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Düzenle
                    </DropdownMenuItem>
                  )}
                  {onToggleStatus && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleToggleStatus}>
                        {athlete.status === 'Aktif' ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Pasif Yap
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Aktif Yap
                          </>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Sports Branches */}
            {athlete.sportsBranches && athlete.sportsBranches.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {athlete.sportsBranches.slice(0, 3).map((sport, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {sport}
                    </Badge>
                  ))}
                  {athlete.sportsBranches.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{athlete.sportsBranches.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Parent Info */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{parentFullName}</span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <button
                  onClick={handlePhoneClick}
                  className="hover:text-primary transition-colors truncate text-left"
                >
                  {athlete.parentPhone}
                </button>
              </div>

              {athlete.parentEmail && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                  <button
                    onClick={handleEmailClick}
                    className="hover:text-primary transition-colors truncate text-left"
                  >
                    {athlete.parentEmail}
                  </button>
                </div>
              )}

              {athlete.city && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{athlete.city}</span>
                </div>
              )}

              {registrationDate && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{registrationDate}</span>
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className={statusColor}>
                {athlete.status}
              </Badge>
              
              {athlete.paymentStatus && (
                <Badge className={paymentStatusColor}>
                  {athlete.paymentStatus}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AthleteCard.displayName = 'AthleteCard';

export default AthleteCard;