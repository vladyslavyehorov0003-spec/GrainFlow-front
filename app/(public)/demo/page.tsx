"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const batches = [
  {
    id: "1",
    contract: "CNT-001",
    culture: "WHEAT",
    volume: "500 т",
    status: "ACTIVE",
  },
  {
    id: "2",
    contract: "CNT-002",
    culture: "CORN",
    volume: "300 т",
    status: "PLANNED",
  },
  {
    id: "3",
    contract: "CNT-003",
    culture: "SUNFLOWER",
    volume: "200 т",
    status: "CLOSED",
  },
];

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  PLANNED: "secondary",
  CLOSED: "outline",
};

export default function DemoPage() {
  const [loading, setLoading] = useState(false);

  function simulateLoad() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">shadcn/ui demo</h1>
          <p className="text-muted-foreground mt-1">
            Огляд компонентів для GrainFlow.{" "}
            {/* ВАЖЛИВО: ця версія shadcn (canary) використовує @base-ui/react.
                Замість asChild використовуй render prop:
                <Trigger render={<Button />}>text</Trigger> */}
          </p>
        </div>
        <Avatar>
          <AvatarFallback>MG</AvatarFallback>
        </Avatar>
      </div>

      <Separator />

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Компоненти</TabsTrigger>
          <TabsTrigger value="table">Таблиця</TabsTrigger>
          <TabsTrigger value="forms">Форми</TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════
            TAB 1 — Компоненти
        ════════════════════════════════════════ */}
        <TabsContent value="components" className="space-y-6 pt-4">
          {/* Button variants */}
          <Card>
            <CardHeader>
              <CardTitle>Button</CardTitle>
              <CardDescription>Всі варіанти кнопок</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button disabled>Disabled</Button>
            </CardContent>
          </Card>

          {/* Badge */}
          <Card>
            <CardHeader>
              <CardTitle>Badge</CardTitle>
              <CardDescription>Статуси, мітки</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Badge>ACTIVE</Badge>
              <Badge variant="secondary">PLANNED</Badge>
              <Badge variant="outline">CLOSED</Badge>
              <Badge variant="destructive">REJECTED</Badge>
            </CardContent>
          </Card>

          {/* Sonner toasts */}
          <Card>
            <CardHeader>
              <CardTitle>Sonner — Toast</CardTitle>
              <CardDescription>
                Використання:{" "}
                <code className="bg-muted px-1 rounded text-xs">{`toast.success("text")`}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => toast.success("Батч створено успішно!")}
              >
                Success
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.error("Помилка: недостатньо місця")}
              >
                Error
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Аналіз в процесі...")}
              >
                Info
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.warning("Вологість перевищує норму")}
              >
                Warning
              </Button>
            </CardContent>
          </Card>

          {/* Dialog */}
          <Card>
            <CardHeader>
              <CardTitle>Dialog</CardTitle>
              <CardDescription>
                Тригер рендериться через{" "}
                <code className="bg-muted px-1 rounded text-xs">
                  {"render={<Button />}"}
                </code>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Dialog>
                {/* render prop замість asChild */}
                <DialogTrigger render={<Button variant="outline" />}>
                  Відкрити Dialog
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Створити батч</DialogTitle>
                    <DialogDescription>
                      Заповніть дані для нового контракту
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1">
                      <Label>Номер контракту</Label>
                      <Input placeholder="CNT-004" />
                    </div>
                    <div className="space-y-1">
                      <Label>Культура</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Обрати культуру" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WHEAT">Пшениця</SelectItem>
                          <SelectItem value="CORN">Кукурудза</SelectItem>
                          <SelectItem value="SUNFLOWER">Соняшник</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => toast.success("Збережено!")}>
                      Зберегти
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* AlertDialog */}
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" />}>
                  Видалити
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ця дія незворотня. Батч буде видалено назавжди.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Скасувати</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => toast.error("Батч видалено")}
                    >
                      Видалити
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Sheet / Dropdown / Tooltip */}
          <Card>
            <CardHeader>
              <CardTitle>Sheet / Dropdown / Tooltip</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {/* Sheet — бічна панель */}
              <Sheet>
                <SheetTrigger render={<Button variant="outline" />}>
                  Відкрити Sheet
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Деталі силосу</SheetTitle>
                    <SheetDescription>Silo-A1 · 350 / 500 т</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-3 px-4">
                    <p className="text-sm text-muted-foreground">
                      Культура: Пшениця
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Заповненість: 70%
                    </p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: "70%" }}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  Dropdown ▾
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Дії</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => toast.info("Редагування...")}
                  >
                    Редагувати
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("Закрити батч")}>
                    Закрити
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    Видалити
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tooltip */}
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" />}>
                  Hover me
                </TooltipTrigger>
                <TooltipContent>Підказка для кнопки</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>

          {/* Skeleton */}
          <Card>
            <CardHeader>
              <CardTitle>Skeleton</CardTitle>
              <CardDescription>Loading-стан</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={simulateLoad}>
                {loading ? "Завантаження..." : "Симулювати завантаження"}
              </Button>
              {loading ?
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              : <p className="text-sm text-muted-foreground">
                  Дані завантажено.
                </p>
              }
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════
            TAB 2 — Таблиця
        ════════════════════════════════════════ */}
        <TabsContent value="table" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Table</CardTitle>
              <CardDescription>
                Список батчів з Badge і Dropdown-меню дій
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Контракт</TableHead>
                    <TableHead>Культура</TableHead>
                    <TableHead>обём</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Дії</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        {b.contract}
                      </TableCell>
                      <TableCell>{b.culture}</TableCell>
                      <TableCell>{b.volume}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[b.status]}>
                          {b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="sm" />}
                          >
                            •••
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Переглянути</DropdownMenuItem>
                            <DropdownMenuItem>Редагувати</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive">
                              Видалити
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════
            TAB 3 — Форми
        ════════════════════════════════════════ */}
        <TabsContent value="forms" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Form inputs</CardTitle>
              <CardDescription>Input, Select, Textarea, Label</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-1">
                <Label htmlFor="contract">Номер контракту</Label>
                <Input id="contract" placeholder="CNT-001" />
              </div>
              <div className="space-y-1">
                <Label>Культура</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Обрати..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHEAT">Пшениця</SelectItem>
                    <SelectItem value="CORN">Кукурудза</SelectItem>
                    <SelectItem value="SUNFLOWER">Соняшник</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="comment">Коментар</Label>
                <Textarea
                  id="comment"
                  placeholder="Додаткова інформація..."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button onClick={() => toast.success("Форму збережено!")}>
                Зберегти
              </Button>
              <Button variant="outline" onClick={() => toast.info("Скасовано")}>
                Скасувати
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
