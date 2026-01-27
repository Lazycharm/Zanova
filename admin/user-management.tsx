import { Icon } from "@iconify/react";

export function UserManagement() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-foreground pb-20">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shadow-sm">
        <div className="flex items-center gap-3">
          <button className="flex items-center justify-center p-1 rounded-full active:bg-white/10">
            <Icon icon="solar:hamburger-menu-linear" className="size-6" />
          </button>
          <h1 className="text-lg font-semibold font-heading">User Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center p-1 rounded-full active:bg-white/10">
            <Icon icon="solar:refresh-linear" className="size-5" />
          </button>
          <button className="flex items-center justify-center p-1 rounded-full active:bg-white/10">
            <Icon icon="solar:bell-bing-linear" className="size-5" />
          </button>
        </div>
      </header>
      <div className="bg-card px-4 py-3 border-b border-border space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search username or email..."
              className="w-full bg-input border-none rounded-md py-2 pl-9 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <button className="flex items-center justify-center px-3 py-2 bg-chart-2 text-white rounded-md text-sm font-medium gap-1 active:opacity-80">
            <Icon icon="solar:add-circle-bold" className="size-4" />
            <span>Batch Add</span>
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing 1 to 10 of 6897 rows</span>
          <div className="flex items-center gap-2">
            <Icon icon="solar:list-check-linear" className="size-4" />
            <Icon icon="solar:settings-linear" className="size-4" />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">ID: 88076</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-2/10 text-chart-2 text-[10px] font-bold">
                <div className="size-1.5 rounded-full bg-chart-2" />
                Normal
              </div>
            </div>
            <button className="text-primary text-xs font-bold flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-md active:bg-primary/20">
              <Icon icon="solar:pen-new-square-bold" className="size-3.5" />
              Edit
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Username
              </span>
              <span className="text-sm font-medium">Lavernefashionshop</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                User Balance
              </span>
              <span className="text-sm font-bold text-primary">0.00</span>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Email
              </span>
              <span className="text-sm">laverne87elaine@gmail.com</span>
            </div>
            <div className="flex flex-col gap-1 col-span-2 pt-1 border-t border-border/30">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span>Last Login: 2026-01-26 23:03:43</span>
                <span>IP: 168.232.147.85</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">ID: 88075</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-2/10 text-chart-2 text-[10px] font-bold">
                <div className="size-1.5 rounded-full bg-chart-2" />
                Normal
              </div>
            </div>
            <button className="text-primary text-xs font-bold flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-md active:bg-primary/20">
              <Icon icon="solar:pen-new-square-bold" className="size-3.5" />
              Edit
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Username
              </span>
              <span className="text-sm font-medium">Delicate</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                User Balance
              </span>
              <span className="text-sm font-bold text-primary">0.00</span>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Email
              </span>
              <span className="text-sm">delicateali16@gmail.com</span>
            </div>
            <div className="flex flex-col gap-1 col-span-2 pt-1 border-t border-border/30">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span>Last Login: 2026-01-26 19:09:15</span>
                <span>IP: 37.221.113.170</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">ID: 88074</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-2/10 text-chart-2 text-[10px] font-bold">
                <div className="size-1.5 rounded-full bg-chart-2" />
                Normal
              </div>
            </div>
            <button className="text-primary text-xs font-bold flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-md active:bg-primary/20">
              <Icon icon="solar:pen-new-square-bold" className="size-3.5" />
              Edit
            </button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Username
              </span>
              <span className="text-sm font-medium">Tienda bonita</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                User Balance
              </span>
              <span className="text-sm font-bold text-primary">0.00</span>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Email
              </span>
              <span className="text-sm">normap23@gmail.com</span>
            </div>
            <div className="flex flex-col gap-1 col-span-2 pt-1 border-t border-border/30">
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span>Last Login: 2026-01-26 08:56:43</span>
                <span>IP: 0.0.0.0</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 py-4">
          <button className="size-8 flex items-center justify-center rounded border border-border bg-card active:bg-muted text-muted-foreground">
            <Icon icon="solar:alt-arrow-left-linear" className="size-4" />
          </button>
          <button className="size-8 flex items-center justify-center rounded bg-primary text-primary-foreground font-semibold text-sm">
            1
          </button>
          <button className="size-8 flex items-center justify-center rounded border border-border bg-card text-foreground font-medium text-sm">
            2
          </button>
          <button className="size-8 flex items-center justify-center rounded border border-border bg-card text-foreground font-medium text-sm">
            3
          </button>
          <button className="size-8 flex items-center justify-center rounded border border-border bg-card text-foreground font-medium text-sm">
            4
          </button>
          <button className="size-8 flex items-center justify-center rounded border border-border bg-card active:bg-muted text-muted-foreground">
            <Icon icon="solar:alt-arrow-right-linear" className="size-4" />
          </button>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-2 pb-5 z-20">
        <button className="flex flex-col items-center gap-1 p-1">
          <Icon icon="solar:home-2-linear" className="size-6 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">front page</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-1">
          <Icon icon="solar:widget-2-linear" className="size-6 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Classification</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-1">
          <Icon icon="solar:cart-large-linear" className="size-6 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Cart</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-1">
          <Icon icon="solar:user-bold" className="size-6 text-primary" />
          <span className="text-[10px] text-primary font-medium">mine</span>
        </button>
      </div>
    </div>
  );
}
