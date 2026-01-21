import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="hidden h-8 w-8 lg:flex"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Show all pages if totalPages is small, else show first, last, and around current
                        if (
                            totalPages <= 5 ||
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                            return (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 w-8"
                                    onClick={() => onPageChange(page)}
                                >
                                    {page}
                                </Button>
                            );
                        } else if (
                            (page === currentPage - 2 && page > 1) ||
                            (page === currentPage + 2 && page < totalPages)
                        ) {
                            return <span key={page} className="px-1 text-muted-foreground">...</span>;
                        }
                        return null;
                    })}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="hidden h-8 w-8 lg:flex"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
