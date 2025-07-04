import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ResultComponentSkeleton = () => {
  return (
    <Card className="w-full border-orange-300 border-2">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <div className="flex gap-2 items-center">
              <Skeleton className="h-7 w-24" />
            </div>
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
          <div className="text-sm text-right">
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Simulate 2 fields */}
        {[0, 1].map((index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>

            <div className="space-y-2">
              {/* Field Analysis Section */}
              <div className="border rounded">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>

              {/* Result Section */}
              <div className="border rounded">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* <div className="border-t pt-3 mt-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Input
              </p>
              <Skeleton className="h-5 w-20 mt-1" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
            <div>
              <p className="text-muted-foreground">Output</p>
              <Skeleton className="h-5 w-16 mt-1" />
              <Skeleton className="h-3 w-16 mt-1" />
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <Skeleton className="h-5 w-24 mt-1" />
            </div>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
};
