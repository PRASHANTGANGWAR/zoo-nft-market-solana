use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("8MtwtbgExduWQo1MxQ9bJuDhSvynLYTECmPqFN6wDhLo");

#[program]
mod zoo_nft_market_solana {
    use super::*;

    // Ensure that only the admin can call this function
    pub fn set_admin_address(
        ctx: Context<Initialize>,
        subscription_fees_wallet_add: Pubkey,
    ) -> Result<()> {
        // Verify the caller is a signer (admin)
        if !ctx.accounts.signer.is_signer {
            return Err(ErrorCode::Unauthorized.into());
        }

        // Update the subscription_fees_wallet_add
        ctx.accounts.new_account.subscription_fees_wallet_add = subscription_fees_wallet_add;
        msg!(
            "Changed wallet address to: {}!",
            subscription_fees_wallet_add
        ); // Message will show up in the tx logs
        Ok(())
    }

    // Getter function to read the value from the smart contract's state
    pub fn get_data(ctx: Context<GetAccountData>) -> Result<Pubkey> {
        msg!(
            "get data: {}!",
            ctx.accounts.new_account.subscription_fees_wallet_add
        );
        Ok(ctx.accounts.new_account.subscription_fees_wallet_add)
    }
}

// Error codes for custom errors
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: Only the admin can call this function.")]
    Unauthorized,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 32 bytes come from NewAccount.data being type Pubkey.
    // (Pubkey = 32 bytes)
    #[account(init, payer = signer, space = 8 + 32)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Struct for the NewAccount
#[account]
pub struct NewAccount {
    subscription_fees_wallet_add: Pubkey,
}

#[derive(Accounts)]
pub struct GetAccountData<'info> {
    #[account(mut)]
    pub new_account: Account<'info, NewAccount>,
}
