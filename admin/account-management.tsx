import { Icon } from "@iconify/react";

export function AccountManagement() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 font-sans text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shadow-sm">
        <div className="w-6" />
        <h1 className="text-lg font-semibold font-heading">Account Management</h1>
        <button className="flex items-center justify-center p-1 rounded-full hover:bg-white/10">
          <Icon icon="solar:global-linear" className="size-6" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="bg-card mb-2 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/a/ACg8ocLVn-vE3NU-iVRclqLEoVYRRoAhogzLYNQmW5mq_b5vBzj1ykg=s96-c"
              alt="Profile"
              className="size-14 rounded-full object-cover border border-border"
            />
            <div className="flex flex-col">
              <span className="font-bold text-base">Samsang Somo</span>
              <span className="text-xs text-muted-foreground mt-0.5">bloo****.com</span>
              <span className="text-xs text-muted-foreground">ID: 87119</span>
            </div>
          </div>
          <Icon icon="solar:alt-arrow-right-linear" className="size-5 text-muted-foreground" />
        </div>
        <div className="bg-card mb-2 py-4 grid grid-cols-4 divide-x divide-border/40">
          <div className="flex flex-col items-center justify-center gap-1 px-1">
            <span className="text-base font-bold">0</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              My Collection
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 px-1">
            <span className="text-base font-bold">0</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              Shop Collection
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 px-1">
            <span className="text-base font-bold">20</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              My Browse
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 px-1">
            <span className="text-base font-bold text-primary truncate w-full text-center">
              $55404.97
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              Account Balance
            </span>
          </div>
        </div>
        <div className="bg-card mb-2 p-4 pb-0">
          <h2 className="text-sm font-bold mb-4">My Orders</h2>
          <div className="grid grid-cols-5 gap-1 mb-6">
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:card-linear" className="size-6 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Payment pending
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:box-linear" className="size-6 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Waiting for delivery
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:delivery-linear" className="size-6 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Waiting for receipt
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:chat-square-text-linear" className="size-6 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Completed
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon icon="solar:restart-linear" className="size-6 text-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                Refund/ After-sales
              </span>
            </div>
          </div>
          <div className="flex items-center border-t border-border">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 active:bg-muted/50">
              <Icon icon="solar:download-linear" className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">Top up</span>
            </button>
            <div className="w-[1px] h-6 bg-border" />
            <button className="flex-1 flex items-center justify-center gap-2 py-3 active:bg-muted/50">
              <Icon icon="solar:upload-linear" className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium">Withdrawal</span>
            </button>
          </div>
        </div>
        <div className="bg-card flex flex-col divide-y divide-border/30">
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:shop-2-bold" className="size-5 text-blue-500" />
              <span className="text-sm font-medium">Wholesale Management</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:shop-bold" className="size-5 text-pink-500" />
              <span className="text-sm font-medium">Shop Details</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:box-bold" className="size-5 text-purple-500" />
              <span className="text-sm font-medium">Product Management</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:bill-list-bold" className="size-5 text-cyan-500" />
              <span className="text-sm font-medium">Store Orders</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:document-text-bold" className="size-5 text-orange-500" />
              <span className="text-sm font-medium">Billing records</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:map-point-bold" className="size-5 text-orange-500" />
              <span className="text-sm font-medium">Delivery address</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:heart-bold" className="size-5 text-pink-500" />
              <span className="text-sm font-medium">Shop Collection</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:headphones-round-sound-bold" className="size-5 text-red-400" />
              <span className="text-sm font-medium">Service Center</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:wallet-bold" className="size-5 text-purple-500" />
              <span className="text-sm font-medium">Wallet Management</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:lock-bold" className="size-5 text-cyan-500" />
              <span className="text-sm font-medium">Login Password</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:key-bold" className="size-5 text-orange-500" />
              <span className="text-sm font-medium">Payment password</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:download-square-bold" className="size-5 text-blue-500" />
              <span className="text-sm font-medium">Download the app</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:settings-bold" className="size-5 text-gray-400" />
              <span className="text-sm font-medium">set up</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
          </button>
          <button className="flex items-center justify-between p-4 active:bg-muted/30">
            <div className="flex items-center gap-3">
              <Icon icon="solar:logout-2-bold" className="size-5 text-green-600" />
              <span className="text-sm font-medium">Log out</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="size-4 text-muted-foreground" />
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
