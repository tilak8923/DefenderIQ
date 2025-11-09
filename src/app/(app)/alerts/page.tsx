'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserId } from '@/hooks/use-user-id';
import { collection, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { AlertRule } from '@/lib/types';


const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'default'; // yellow
      default:
        return 'outline';
    }
};

export default function AlertsPage() {
    const userId = useUserId();
    const firestore = useFirestore();
    const [rules, setRules] = useState<AlertRule[]>([]);
    
    // Form state for new rule
    const [newRuleName, setNewRuleName] = useState('');
    const [newRuleCondition, setNewRuleCondition] = useState('');
    const [newRuleSeverity, setNewRuleSeverity] = useState('');


    useEffect(() => {
        if (!userId || !firestore) return;

        const rulesQuery = collection(firestore, 'users', userId, 'alertRules');
        const unsubscribe = onSnapshot(rulesQuery, (snapshot) => {
            const rulesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlertRule));
            setRules(rulesData);
        }, (error) => {
            console.error("Error fetching alert rules:", error);
        });

        return () => unsubscribe();
    }, [userId, firestore]);
    
    const handleToggleRule = async (rule: AlertRule) => {
        if (!userId || !firestore) return;
        const ruleRef = doc(firestore, 'users', userId, 'alertRules', rule.id);
        await updateDoc(ruleRef, { enabled: !rule.enabled });
    }

    const handleCreateRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !newRuleName || !newRuleCondition || !newRuleSeverity || !firestore) return;

        await addDoc(collection(firestore, 'users', userId, 'alertRules'), {
            name: newRuleName,
            condition: newRuleCondition,
            severity: newRuleSeverity,
            enabled: true,
        });
        
        // Reset form
        setNewRuleName('');
        setNewRuleCondition('');
        setNewRuleSeverity('');
    }

    return (
        <div className="flex flex-col gap-4">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-wider">Alert Management</h1>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleCreateRule}>
                            <DialogHeader>
                                <DialogTitle>Create New Alert Rule</DialogTitle>
                                <DialogDescription>
                                   Define the conditions for a new security alert.
                                </DialogDescription>
                            </DialogHeader>
                             <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" value={newRuleName} onChange={e => setNewRuleName(e.target.value)} className="col-span-3" />
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="condition" className="text-right">Condition</Label>
                                    <Input id="condition" value={newRuleCondition} onChange={e => setNewRuleCondition(e.target.value)} placeholder="e.g., event.type == 'failed_login'" className="col-span-3" />
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="severity" className="text-right">Severity</Label>
                                     <Select onValueChange={setNewRuleSeverity}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select severity" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Critical">Critical</SelectItem>
                                        </SelectContent>
                                     </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Rule</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Configured Alert Rules</CardTitle>
                    <CardDescription>Manage and review all active and disabled alert rules.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rule Name</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{rule.name}</TableCell>
                                    <TableCell className="font-mono text-sm text-muted-foreground">{rule.condition}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={getSeverityBadgeVariant(rule.severity)}
                                            className={cn(rule.severity === 'Medium' && 'bg-warning text-black')}
                                        >
                                            {rule.severity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch id={`status-${rule.id}`} checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule)}/>
                                            <Label htmlFor={`status-${rule.id}`}>{rule.enabled ? 'Enabled' : 'Disabled'}</Label>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
