import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Database, FileSearch, Edit3, Users } from "lucide-react";
import { Link } from "wouter";
import ProductManagement from "@/components/product-management";

export default function AdminDataManagement() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Data Management Center
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Manage products database and review data change requests
        </p>
      </div>

      {/* Quick Actions Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <FileSearch className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-300">
            Navigate to key data management features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data Change Requests Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white">
                      <Edit3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Data Change Requests
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Review user-submitted data changes
                      </p>
                    </div>
                  </div>
                  <Link href="/admin-data-requests" data-testid="link-data-requests">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900/20"
                      data-testid="button-view-requests"
                    >
                      View Requests
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Products Database Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        Products Database
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage product entries directly
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Managed below ↓
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Product Management Section */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Products Database Management
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Search, edit, and manage product entries in the database
            </p>
          </div>
        </div>
        <ProductManagement />
      </div>
    </div>
  );
}