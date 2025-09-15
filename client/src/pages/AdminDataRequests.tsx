import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Package,
  User,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type DataChangeRequest } from "@shared/schema";

export default function AdminDataRequests() {
  const [selectedRequest, setSelectedRequest] = useState<DataChangeRequest | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewComments, setReviewComments] = useState("");
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all data change requests for admin review
  const { data: requests, isLoading, error } = useQuery<DataChangeRequest[]>({
    queryKey: ['/api/admin/data-change-requests'],
  });

  const approveMutation = useMutation({
    mutationFn: async (data: { id: number; reviewComments: string }) => {
      return await apiRequest("PUT", `/api/data-change-requests/${data.id}/approve`, {
        reviewComments: data.reviewComments
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/data-change-requests'] });
      toast({
        title: "Request approved",
        description: "The data change request has been approved and applied.",
      });
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewComments("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: { id: number; reviewComments: string }) => {
      return await apiRequest("PUT", `/api/data-change-requests/${data.id}/reject`, {
        reviewComments: data.reviewComments
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/data-change-requests'] });
      toast({
        title: "Request rejected",
        description: "The data change request has been rejected.",
      });
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewComments("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReview = (request: DataChangeRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setShowReviewDialog(true);
  };

  const handleSubmitReview = () => {
    if (!selectedRequest) return;

    const mutation = reviewAction === "approve" ? approveMutation : rejectMutation;
    mutation.mutate({
      id: selectedRequest.id,
      reviewComments: reviewComments,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "in_review":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Eye className="w-3 h-3 mr-1" />In Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const filterRequestsByStatus = (status: string) => {
    if (!requests) return [];
    return requests.filter(request => request.status === status);
  };

  const renderRequestCard = (request: DataChangeRequest) => (
    <Card key={request.id} className="mb-4" data-testid={`request-card-${request.id}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-4 h-4" />
              {request.productName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-3 h-3" />
              User ID: {request.userId}
              <Calendar className="w-3 h-3 ml-2" />
              {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(request.status)}
            {getPriorityBadge(request.priority)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-1">Request Type</h4>
          <Badge variant="outline" className="capitalize">{request.requestType.replace('_', ' ')}</Badge>
        </div>
        
        <div>
          <h4 className="font-medium mb-1">Description</h4>
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </div>

        <div>
          <h4 className="font-medium mb-1">Product Barcode</h4>
          <code className="text-xs bg-muted px-2 py-1 rounded">{request.productBarcode}</code>
        </div>

        {request.proposedChanges && (
          <div>
            <h4 className="font-medium mb-2">Proposed Changes</h4>
            <div className="bg-muted p-3 rounded-lg">
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {String(JSON.stringify(request.proposedChanges, null, 2))}
              </pre>
            </div>
          </div>
        )}

        {request.reviewComments && (
          <div>
            <h4 className="font-medium mb-1">Review Comments</h4>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{request.reviewComments}</p>
            {request.reviewedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Reviewed on {format(new Date(request.reviewedAt), 'MMM dd, yyyy HH:mm')}
              </p>
            )}
          </div>
        )}

        {request.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleReview(request, "approve")}
              data-testid={`button-approve-${request.id}`}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReview(request, "reject")}
              data-testid={`button-reject-${request.id}`}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                  <div className="h-20 bg-muted rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingRequests = filterRequestsByStatus("pending");
  const approvedRequests = filterRequestsByStatus("approved");
  const rejectedRequests = filterRequestsByStatus("rejected");

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Data Change Requests</h1>
        <p className="text-muted-foreground">Review and manage user-submitted product data changes</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No pending requests</h3>
                <p className="text-muted-foreground">All data change requests have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="pending-requests">
              {pendingRequests.map(renderRequestCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No approved requests</h3>
                <p className="text-muted-foreground">No requests have been approved yet</p>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="approved-requests">
              {approvedRequests.map(renderRequestCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No rejected requests</h3>
                <p className="text-muted-foreground">No requests have been rejected yet</p>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="rejected-requests">
              {rejectedRequests.map(renderRequestCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent data-testid="review-dialog">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve" : "Reject"} Data Change Request
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve" 
                ? "This will approve the changes and apply them to the product database."
                : "This will reject the request. Please provide a reason for rejection."
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Product: {selectedRequest.productName}</h4>
                <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Review Comments</label>
                <Textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder={
                    reviewAction === "approve" 
                      ? "Optional: Add any comments about the approval..." 
                      : "Please explain why this request is being rejected..."
                  }
                  className="mt-1"
                  data-testid="textarea-review-comments"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              variant={reviewAction === "approve" ? "default" : "destructive"}
              data-testid="button-submit-review"
            >
              {approveMutation.isPending || rejectMutation.isPending ? "Processing..." : 
               reviewAction === "approve" ? "Approve Request" : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}